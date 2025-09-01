import { IsOptional, IsEnum, IsDateString, IsMongoId } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRole } from '../../schemas/enums';

export class FilterUsersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role filter' })
  role?: UserRole;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for createdAfter' })
  createdAfter?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for createdBefore' })
  createdBefore?: string;
}
