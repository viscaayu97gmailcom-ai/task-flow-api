
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

import { EventStatus } from '../../../database/enums/event-status.enum';
import type { EventSortField } from '../../../database/interfaces/event-repository.interface';

export class FindAllEventsQueryDto {
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
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsIn([
    'createdAt',
    'updatedAt',
    'startDate',
    'endDate',
    'name',
    'status',
  ])
  sortBy?: EventSortField;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
