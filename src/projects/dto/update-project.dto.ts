import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsMongoId } from 'class-validator';
import { ProjectStatus, Priority } from '../../schemas/enums';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsMongoId()
  managerId?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  developersIds?: string[];
}
