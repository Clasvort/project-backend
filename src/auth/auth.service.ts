import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Crear el nuevo usuario
    const user = await this.usersService.create(registerDto);
    
    // Generar tokens - usar el id transformado
    const userId = user.id || (user._id as any).toString();
    const payload = { email: user.email, sub: userId, name: user.name, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    // Guardar refresh token en la base de datos
    await this.usersService.updateRefreshToken(userId, refreshToken);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // Buscar usuario por email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verificar contraseña
    const isPasswordValid = await this.encryptionService.comparePassword(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Actualizar último login
    const userId = (user._id as any).toString();
    await this.usersService.updateLastLogin(userId);
    
    // Generar tokens - usar el userId string
    const payload = { email: user.email, sub: userId, name: user.name, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    // Guardar refresh token
    await this.usersService.updateRefreshToken(userId, refreshToken);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      // Verificar el refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
      
      // Buscar usuario y verificar que el refresh token coincida
      const user = await this.usersService.findOne(payload.sub);
      if (!user || user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generar nuevos tokens
      const newPayload = { email: user.email, sub: user._id, name: user.name, role: user.role };
      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });
      
      // Actualizar refresh token
      await this.usersService.updateRefreshToken((user._id as any).toString(), newRefreshToken);
      
      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    // Limpiar refresh token
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };
  }

  /**
   * Generate a secure password reset token
   * @param email - User email
   * @returns Object with success status and message
   */
  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate secure reset token
    const resetToken = this.encryptionService.generateSecureToken();
    const hashedToken = this.encryptionService.hashToken(resetToken);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Save hashed token to user (you'll need to add these fields to user schema)
    await this.usersService.updatePasswordResetToken(
      (user._id as any).toString(),
      hashedToken,
      expiresAt
    );

    // In production, send email with resetToken
    // For now, return token for testing (remove in production)
    return {
      message: 'Password reset token generated',
      resetToken: resetToken // Remove this in production
    };
  }

  /**
   * Reset password using token
   * @param token - Reset token
   * @param email - User email
   * @param newPassword - New password
   * @returns Success message
   */
  async resetPassword(token: string, email: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Check if token is expired
    if (new Date() > user.passwordResetExpires) {
      throw new UnauthorizedException('Reset token has expired');
    }

    // Verify token using constant-time comparison
    const hashedToken = this.encryptionService.hashToken(token);
    const isValidToken = this.encryptionService.secureCompare(hashedToken, user.passwordResetToken);
    
    if (!isValidToken) {
      throw new UnauthorizedException('Invalid reset token');
    }

    // Hash new password and update user
    const hashedPassword = await this.encryptionService.hashPassword(newPassword);
    await this.usersService.updatePasswordAndClearResetToken(
      (user._id as any).toString(),
      hashedPassword
    );

    return { message: 'Password has been successfully reset' };
  }

  /**
   * Change password for authenticated user
   * @param userId - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Success message
   */
  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.encryptionService.comparePassword(
      currentPassword, 
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and update new password
    const hashedNewPassword = await this.encryptionService.hashPassword(newPassword);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    // Invalidate refresh token for security
    await this.usersService.updateRefreshToken(userId, null);

    return { message: 'Password has been successfully changed' };
  }
}
