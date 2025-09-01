import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private encryptionService: EncryptionService,
  ) {}

  private transformUser(user: UserDocument): any {
    const transformed = user.toObject();
    // Convertir _id a id para facilitar uso en frontend
    transformed.id = transformed._id.toString();
    delete transformed._id;
    delete transformed.__v;
    delete transformed.password; // Nunca exponer la contraseña
    
    return transformed;
  }

  private transformUsers(users: UserDocument[]): any[] {
    return users.map(user => this.transformUser(user));
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    // Verificar si el email ya existe
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const userData = { ...createUserDto };
      if (userData.password) {
        // Usar el nuevo servicio de cifrado con mayor seguridad
        userData.password = await this.encryptionService.hashPassword(userData.password);
      }
      
      const createdUser = new this.userModel(userData);
      const savedUser = await createdUser.save();
      return this.transformUser(savedUser);
    } catch (error) {
      throw new BadRequestException('Error creating user');
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    role?: string,
    isActive?: boolean,
  ): Promise<{ users: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    // Construir filtros
    const filters: any = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive;

    const [users, total] = await Promise.all([
      this.userModel
        .find(filters)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments(filters).exec(),
    ]);

    return {
      users: this.transformUsers(users),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllPaginated(filterDto: FilterUsersDto): Promise<PaginatedResult<UserDocument>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, ...filters } = filterDto;
    
    // Build filter query
    const filterQuery: FilterQuery<UserDocument> = { isDeleted: { $ne: true } };
    
    // Apply filters
    if (filters.role) filterQuery.role = filters.role;
    if (filters.isActive !== undefined) filterQuery.isActive = filters.isActive;
    
    // Date filters
    if (filters.createdAfter || filters.createdBefore) {
      filterQuery.createdAt = {};
      if (filters.createdAfter) filterQuery.createdAt.$gte = new Date(filters.createdAfter);
      if (filters.createdBefore) filterQuery.createdAt.$lte = new Date(filters.createdBefore);
    }
    
    // Search functionality
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute queries
    const [data, total] = await Promise.all([
      this.userModel
        .find(filterQuery)
        .select('-password -refreshToken')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filterQuery).exec()
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async findOne(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).select('-password').exec();
    } catch (error) {
      throw new BadRequestException('Invalid user ID');
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
    try {
      // Verificar si el email ya existe (si se está actualizando)
      if (updateUserDto.email) {
        const existingUser = await this.userModel.findOne({ 
          email: updateUserDto.email, 
          _id: { $ne: id } 
        });
        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }
      }

      const userData = { ...updateUserDto };
      if (userData.password) {
        // Usar el nuevo servicio de cifrado con mayor seguridad
        userData.password = await this.encryptionService.hashPassword(userData.password);
      }

      return await this.userModel
        .findByIdAndUpdate(id, userData, { new: true })
        .select('-password')
        .exec();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Invalid user ID or data');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(id).exec();
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Soft delete
      await this.userModel.findByIdAndUpdate(id, {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date()
      }).exec();

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid user ID');
    }
  }

  async restore(id: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this.userModel.findByIdAndUpdate(
        id,
        {
          isDeleted: false,
          isActive: true,
          $unset: { deletedAt: 1 }
        },
        { new: true }
      ).select('-password');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid user ID');
    }
  }

  // Métodos adicionales útiles
  async getUsersByRole(role: string): Promise<UserDocument[]> {
    return await this.userModel
      .find({ role, isActive: true })
      .select('-password')
      .sort({ name: 1 })
      .exec();
  }

  async getDevelopers(): Promise<UserDocument[]> {
    return this.getUsersByRole('developer');
  }

  async getManagers(): Promise<UserDocument[]> {
    return this.getUsersByRole('manager');
  }

  async toggleUserStatus(id: string): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this.userModel
        .findByIdAndUpdate(id, { isActive: !user.isActive }, { new: true })
        .select('-password')
        .exec();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid user ID');
    }
  }

  async searchUsers(query: string): Promise<UserDocument[]> {
    return await this.userModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ],
        isActive: true
      })
      .select('-password')
      .limit(10)
      .exec();
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() }).exec();
  }

  /**
   * Update password reset token for user
   * @param userId - User ID
   * @param hashedToken - Hashed reset token
   * @param expiresAt - Token expiration date
   */
  async updatePasswordResetToken(userId: string, hashedToken: string, expiresAt: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expiresAt
    }).exec();
  }

  /**
   * Update password and clear reset token
   * @param userId - User ID
   * @param hashedPassword - New hashed password
   */
  async updatePasswordAndClearResetToken(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null // Invalidate refresh token for security
    }).exec();
  }

  /**
   * Update only password
   * @param userId - User ID
   * @param hashedPassword - New hashed password
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword
    }).exec();
  }
}
