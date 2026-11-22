import {
  IPaginatedResult,
  IPaginationQuery,
} from '../../utils/pagination.util';
import { TaskStatus } from '../enums/task-status.enum';
import { ICreateTaskInput, ITask, IUpdateTaskInput } from './task.interface';

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export type TaskSortField =
  'createdAt' | 'updatedAt' | 'dueDate' | 'title' | 'status';

export interface ITaskPaginationQuery extends IPaginationQuery {
  status?: TaskStatus;
  search?: string;
  sortBy?: TaskSortField;
}

export interface ITaskRepository {
  findAll(status?: TaskStatus): Promise<ITask[]>;
  findPaginated(query?: ITaskPaginationQuery): Promise<IPaginatedResult<ITask>>;
  findById(id: string): Promise<ITask | null>;
  create(data: ICreateTaskInput): Promise<ITask>;
  update(id: string, data: IUpdateTaskInput): Promise<ITask | null>;
  updateStatus(id: string, status: TaskStatus): Promise<ITask | null>;
  remove(id: string): Promise<boolean>;
}