export { TaskStatus } from '../enums/task-status.enum';
export type { IBaseEntity } from './base-entity.interface';
export {
  TASK_REPOSITORY,
  type ITaskPaginationQuery,
  type ITaskRepository,
  type TaskSortField,
} from './task-repository.interface';
export type {
  ICreateTaskInput,
  ITask,
  IUpdateTaskInput,
} from './task.interface';