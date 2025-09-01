import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly saltRounds = 12; // Increased from 10 for better security
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits

  /**
   * Hash a password using bcrypt with high salt rounds
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - Plain text password
   * @param hashedPassword - Hashed password from database
   * @returns Boolean indicating if passwords match
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error('Failed to compare passwords');
    }
  }

  /**
   * Generate a secure random salt
   * @param length - Length of the salt (default: 32)
   * @returns Random salt as hex string
   */
  generateSalt(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random key
   * @param length - Length of the key in bytes (default: 32)
   * @returns Random key as hex string
   */
  generateSecureKey(length: number = this.keyLength): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   * @param text - Text to encrypt
   * @param key - Encryption key (hex string)
   * @returns Encrypted data with IV and auth tag
   */
  encryptData(text: string, key: string): { encrypted: string; iv: string; tag: string } {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data encrypted with AES-256-GCM
   * @param encryptedData - Object containing encrypted data, IV, and auth tag
   * @param key - Decryption key (hex string)
   * @returns Decrypted text
   */
  decryptData(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): string {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data using SHA-256 with salt
   * @param data - Data to hash
   * @param salt - Salt for hashing (optional, will generate if not provided)
   * @returns Object with hash and salt
   */
  hashData(data: string, salt?: string): { hash: string; salt: string } {
    try {
      const useSalt = salt || this.generateSalt();
      const hash = crypto.createHash('sha256');
      hash.update(data + useSalt);
      
      return {
        hash: hash.digest('hex'),
        salt: useSalt
      };
    } catch (error) {
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Verify hashed data
   * @param data - Original data
   * @param hash - Hash to verify against
   * @param salt - Salt used for hashing
   * @returns Boolean indicating if data matches hash
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    try {
      const computedHash = this.hashData(data, salt);
      return computedHash.hash === hash;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a secure random token for password reset, email verification, etc.
   * @param length - Length of the token in bytes (default: 32)
   * @returns Random token as hex string
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash a token for storage (to prevent rainbow table attacks)
   * @param token - Token to hash
   * @returns Hashed token
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   * @param a - First string
   * @param b - Second string
   * @returns Boolean indicating if strings are equal
   */
  secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}
