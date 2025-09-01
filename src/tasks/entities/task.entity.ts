import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Priority, TaskStatus } from 'src/schemas/enums';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ 
    type: String, 
    enum: TaskStatus,
    default: TaskStatus.TODO 
  })
  status: TaskStatus;

  @Prop({ 
    type: String, 
    enum: Priority,
    default: Priority.MEDIUM 
  })
  priority: Priority;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: Number })
  estimatedHours?: number;

  @Prop({ type: Number })
  actualHours?: number;

  @Prop({ type: Date })
  dueDate?: Date;

  // Los campos createdAt y updatedAt se generan automáticamente por timestamps: true
}

export const TaskSchema = SchemaFactory.createForClass(Task);
