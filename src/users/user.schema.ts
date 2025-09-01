import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../schemas/enums';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ 
    type: String, 
    enum: UserRole,
    default: UserRole.DEVELOPER 
  })
  role: UserRole;

  @Prop()
  avatar?: string; // URL del avatar

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop()
  refreshToken?: string;

  @Prop({ default: Date.now })
  lastLogin?: Date;

  // Password reset fields
  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  // Los campos createdAt y updatedAt se generan automáticamente por timestamps: true
}

export const UserSchema = SchemaFactory.createForClass(User);

// Índices para optimizar consultas
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ name: 'text', email: 'text' }); // Para búsquedas de texto
