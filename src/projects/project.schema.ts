import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProjectStatus, Priority } from '../schemas/enums';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ 
    type: String, 
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING 
  })
  status: ProjectStatus;

  @Prop({ 
    type: String, 
    enum: Priority,
    default: Priority.MEDIUM 
  })
  priority: Priority;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  managerId: Types.ObjectId; // Manager del proyecto

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  developersIds: Types.ObjectId[]; // Array de desarrolladores

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  // Los campos createdAt y updatedAt se generan automáticamente por timestamps: true
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Índices para optimizar consultas
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ priority: 1 });
ProjectSchema.index({ managerId: 1 });
ProjectSchema.index({ 'developers': 1 });
ProjectSchema.index({ startDate: 1 });
ProjectSchema.index({ endDate: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ name: 'text', description: 'text' }); // Para búsquedas de texto
