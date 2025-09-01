import { 
  IsDateString, 
  IsEnum, 
  IsMongoId, 
  IsOptional, 
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  ValidateIf
} from "class-validator";
import { Transform } from 'class-transformer';
import { Priority, TaskStatus } from "../../schemas/enums";

export class CreateTaskDto {
    @IsString({ message: 'Task name must be a string' })
    @IsNotEmpty({ message: 'Task name is required' })
    // @MinLength(3, { message: 'Task name must be at least 3 characters long' })
    @MaxLength(200, { message: 'Task name must not exceed 200 characters' })
    @Transform(({ value }) => value?.trim())
    title: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
    @Transform(({ value }) => value?.trim())
    description?: string;

    @IsOptional()
    @IsEnum(TaskStatus, { message: 'Invalid task status' })
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(Priority, { message: 'Invalid priority level' })
    priority?: Priority;
    
    @IsOptional()
    @ValidateIf((o) => o.assignedTo !== "" && o.assignedTo !== null)
    @IsMongoId({ message: 'Invalid user ID format for assignment' })
    @Transform(({ value }) => value === "" ? null : value)
    assignedTo?: string;

    @IsOptional()
    @IsMongoId({ message: 'Invalid project ID format' })
    projectId: string;

    @IsOptional()
    estimatedHours?: number;

    @IsOptional()
    actualHours?: number;

    @IsOptional()
    @IsDateString({}, { message: 'Invalid due date format' })
    dueDate?: string;
}
