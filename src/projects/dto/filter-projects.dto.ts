import { IsOptional, IsEnum, IsDateString, IsMongoId } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ProjectStatus, Priority } from '../../schemas/enums';

export class FilterProjectsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Invalid project status filter' })
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(Priority, { message: 'Invalid priority filter' })
  priority?: Priority;

  @IsOptional()
  @IsMongoId({ message: 'Invalid manager ID format' })
  managerId?: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid developer ID format' })
  developerId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for startDateAfter' })
  startDateAfter?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for startDateBefore' })
  startDateBefore?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for endDateAfter' })
  endDateAfter?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for endDateBefore' })
  endDateBefore?: string;
}
