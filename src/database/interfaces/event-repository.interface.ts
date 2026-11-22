
import { EventStatus } from '../enums/event-status.enum';
import {
  ICreateEventInput,
  IEvent,
  IUpdateEventInput,
} from './event.interface';
import { IPaginatedResult } from '../../utils/pagination.util';

export type EventSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'startDate'
  | 'endDate'
  | 'name'
  | 'status';

export interface IEventPaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: EventStatus;
  sortBy?: EventSortField;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IEventRepository {
  findAll(status?: EventStatus): Promise<IEvent[]>;

  findPaginated(
    query?: IEventPaginationQuery,
  ): Promise<IPaginatedResult<IEvent>>;

  findById(id: string): Promise<IEvent | null>;

  create(data: ICreateEventInput): Promise<IEvent>;

  update(
    id: string,
    data: IUpdateEventInput,
  ): Promise<IEvent | null>;

  remove(id: string): Promise<boolean>;
}

export const EVENT_REPOSITORY = 'EVENT_REPOSITORY';
