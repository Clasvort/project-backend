import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsDateString, 
  IsArray, 
  IsMongoId,
  IsNotEmpty,
  MinLength,
  MaxLength,
  ValidateIf
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProjectStatus, Priority } from '../../schemas/enums';

export class CreateProjectDto {
  @IsString({ message: 'Project name must be a string' })
  @IsNotEmpty({ message: 'Project name is required' })
  @MinLength(3, { message: 'Project name must be at least 3 characters long' })
  @MaxLength(200, { message: 'Project name must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Invalid project status' })
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(Priority, { message: 'Invalid priority level' })
  priority?: Priority;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid start date format' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid end date format' })
  @ValidateIf((obj) => obj.startDate && obj.endDate)
  endDate?: string;

  @IsMongoId({ message: 'Invalid manager ID format' })
  @IsNotEmpty({ message: 'Manager ID is required' })
  managerId: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  developersIds?: string[];
}

export class ParamsCreateProjectDto {
  @IsString({ message: 'Project name must be a string' })
  @IsNotEmpty({ message: 'Project name is required' })
  @MinLength(3, { message: 'Project name must be at least 3 characters long' })
  @MaxLength(200, { message: 'Project name must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Invalid project status' })
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(Priority, { message: 'Invalid priority level' })
  priority?: Priority;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid start date format' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid end date format' })
  @ValidateIf((obj) => obj.startDate && obj.endDate)
  endDate?: string;
  
  @IsOptional()
  @IsMongoId({ message: 'Invalid manager ID format' })
  managerId?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  developersIds?: string[];
}
