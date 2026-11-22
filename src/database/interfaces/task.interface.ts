import { TaskStatus } from '../enums/task-status.enum';
import { IBaseEntity } from './base-entity.interface';

export interface ITask extends IBaseEntity {
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: Date | null;
}

export interface ICreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: Date | null;
}

export type IUpdateTaskInput = Partial<ICreateTaskInput>;