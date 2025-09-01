import { IsOptional, IsEnum, IsString } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export enum UserSortField {
  NAME = 'name',
  EMAIL = 'email',
  ROLE = 'role',
  CREATED_AT = 'createdAt',
  LAST_LOGIN = 'lastLogin'
}

export enum ProjectSortField {
  NAME = 'name',
  STATUS = 'status',
  PRIORITY = 'priority',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  CREATED_AT = 'createdAt'
}

export enum TaskSortField {
  NAME = 'name',
  STATUS = 'status',
  PRIORITY = 'priority',
  DUE_DATE = 'dueDate',
  CREATED_AT = 'createdAt',
  ESTIMATED_HOURS = 'estimatedHours'
}

export class SortDto {
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
