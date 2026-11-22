import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  TASK_REPOSITORY,
  TaskStatus,
  type ICreateTaskInput,
  type ITask,
  type ITaskRepository,
  type IUpdateTaskInput,
} from '../../../database/interfaces';
import type { IPaginatedResult } from '../../../utils';
import {
  CreateTaskDto,
  DeleteTaskDataDto,
  FindAllTasksQueryDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from './dto';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  findAll(query: FindAllTasksQueryDto = {}): Promise<IPaginatedResult<ITask>> {
    const normalizedQuery: FindAllTasksQueryDto = { ...query };

    if (
      normalizedQuery.status !== undefined &&
      String(normalizedQuery.status) !== ''
    ) {
      normalizedQuery.status = this.validateStatus(normalizedQuery.status);
    } else {
      delete normalizedQuery.status;
    }

    return this.taskRepository.findPaginated(normalizedQuery);
  }

  async findById(id: string): Promise<ITask> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  create(payload: CreateTaskDto): Promise<ITask> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Request body must be a JSON object');
    }

    const title = this.validateTitle(payload.title);
    const input: ICreateTaskInput = {
      title,
      description: this.validateDescription(payload.description),
      status:
        payload.status !== undefined
          ? this.validateStatus(payload.status)
          : undefined,
      dueDate:
        payload.dueDate !== undefined
          ? this.parseDueDate(payload.dueDate)
          : undefined,
    };

    return this.taskRepository.create(input);
  }

  async update(id: string, payload: UpdateTaskDto): Promise<ITask> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Request body must be a JSON object');
    }

    const input: IUpdateTaskInput = {};

    if (payload.title !== undefined) {
      input.title = this.validateTitle(payload.title);
    }
    if (payload.description !== undefined) {
      input.description = this.validateDescription(payload.description);
    }
    if (payload.status !== undefined) {
      input.status = this.validateStatus(payload.status);
    }
    if (payload.dueDate !== undefined) {
      input.dueDate = this.parseDueDate(payload.dueDate);
    }

    const updated = await this.taskRepository.update(id, input);
    if (!updated) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return updated;
  }

  async updateStatus(id: string, payload: UpdateTaskStatusDto): Promise<ITask> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Request body must be a JSON object');
    }

    const status = this.validateStatus(payload.status);
    const updated = await this.taskRepository.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<DeleteTaskDataDto> {
    const deleted = await this.taskRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return { id, deleted: true };
  }

  private validateTitle(title: unknown): string {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new BadRequestException('title must be a non-empty string');
    }

    const trimmed = title.trim();
    if (trimmed.length > 255) {
      throw new BadRequestException('title must not exceed 255 characters');
    }

    return trimmed;
  }

  private validateDescription(description: unknown): string | null | undefined {
    if (description === undefined || description === null) {
      return description;
    }

    if (typeof description !== 'string') {
      throw new BadRequestException('description must be a string or null');
    }

    return description;
  }

  private validateStatus(status: unknown): TaskStatus {
    if (
      typeof status !== 'string' ||
      !Object.values(TaskStatus).includes(status as TaskStatus)
    ) {
      throw new BadRequestException(
        `status must be one of: ${Object.values(TaskStatus).join(', ')}`,
      );
    }

    return status as TaskStatus;
  }

  private parseDueDate(dueDate: unknown): Date | null {
    if (dueDate === null) {
      return null;
    }

    if (dueDate instanceof Date) {
      if (Number.isNaN(dueDate.getTime())) {
        throw new BadRequestException('dueDate must be a valid date');
      }
      return dueDate;
    }

    if (typeof dueDate === 'string' && dueDate.trim().length > 0) {
      const parsed = new Date(dueDate);
      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException(
          'dueDate must be a valid ISO date string',
        );
      }
      return parsed;
    }

    throw new BadRequestException(
      'dueDate must be a valid ISO date string or null',
    );
  }
}