import { IsOptional, IsEnum, IsDateString, IsMongoId } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TaskStatus, Priority } from '../../schemas/enums';

export class FilterTasksDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Invalid task status filter' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority, { message: 'Invalid priority filter' })
  priority?: Priority;

  @IsOptional()
  @IsMongoId({ message: 'Invalid project ID format' })
  projectId?: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid assignee ID format' })
  assignedTo?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for dueDateAfter' })
  dueDateAfter?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for dueDateBefore' })
  dueDateBefore?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for createdAfter' })
  createdAfter?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for createdBefore' })
  createdBefore?: string;
}
