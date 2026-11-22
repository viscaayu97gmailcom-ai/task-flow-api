import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  type ITaskPaginationQuery,
  type TaskSortField,
  TaskStatus,
} from '../../../../database/interfaces';
import { SortOrder } from 'src/utils';

const TASK_SORT_FIELDS: readonly TaskSortField[] = [
  'createdAt',
  'updatedAt',
  'dueDate',
  'title',
  'status',
];

export class CreateTaskDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsISO8601()
  dueDate?: string | null;
}

export class UpdateTaskDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsISO8601()
  dueDate?: string | null;
}

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}

export class FindAllTasksQueryDto implements ITaskPaginationQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsIn(['ASC', 'DESC'])
  sortOrder?: SortOrder | (string & {});

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @IsIn(TASK_SORT_FIELDS)
  sortBy?: TaskSortField;
}