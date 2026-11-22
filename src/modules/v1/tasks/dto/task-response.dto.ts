import type { ITask } from '../../../../database/interfaces';
import type { IPaginationMeta } from '../../../../utils';

export class ApiResponseDto<T> {
  success!: boolean;
  statusCode!: number;
  message!: string;
  data!: T;
}

export class FindAllTasksResponseDto extends ApiResponseDto<ITask[]> {
  meta!: IPaginationMeta;
}

export class FindTaskByIdResponseDto extends ApiResponseDto<ITask> {}

export class CreateTaskResponseDto extends ApiResponseDto<ITask> {}

export class UpdateTaskResponseDto extends ApiResponseDto<ITask> {}

export class DeleteTaskDataDto {
  id!: string;
  deleted!: boolean;
}

export class DeleteTaskResponseDto extends ApiResponseDto<DeleteTaskDataDto> {}