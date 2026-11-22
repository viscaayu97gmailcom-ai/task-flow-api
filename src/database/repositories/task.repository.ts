import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import {
  createPaginatedResult,
  IPaginatedResult,
  normalizePaginationQuery,
} from '../../utils/pagination.util';
import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status.enum';
import {
  ITaskPaginationQuery,
  ITaskRepository,
  TaskSortField,
} from '../interfaces/task-repository.interface';
import {
  ICreateTaskInput,
  ITask,
  IUpdateTaskInput,
} from '../interfaces/task.interface';

export type CreateTaskData = ICreateTaskInput;
export type UpdateTaskData = IUpdateTaskInput;

const ALLOWED_SORT_FIELDS: readonly TaskSortField[] = [
  'createdAt',
  'updatedAt',
  'dueDate',
  'title',
  'status',
];

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
  ) {}

  findAll(status?: TaskStatus): Promise<ITask[]> {
    return this.repository.find({
      where: status ? { status } : undefined,
      order: { createdAt: 'DESC' },
    });
  }

  async findPaginated(
    query: ITaskPaginationQuery = {},
  ): Promise<IPaginatedResult<ITask>> {
    const { page, limit, skip, take, sortOrder } =
      normalizePaginationQuery(query);
    const sortBy: TaskSortField =
      query.sortBy && ALLOWED_SORT_FIELDS.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';

    const keyword = query.search?.trim();
    let where: FindOptionsWhere<Task> | FindOptionsWhere<Task>[] | undefined;

    if (keyword) {
      const baseCondition: FindOptionsWhere<Task> = query.status
        ? { status: query.status }
        : {};
      where = [
        { ...baseCondition, title: Like(`%${keyword}%`) },
        { ...baseCondition, description: Like(`%${keyword}%`) },
      ];
    } else if (query.status) {
      where = { status: query.status };
    }

    const [items, totalItems] = await this.repository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip,
      take,
    });

    return createPaginatedResult(items, totalItems, page, limit);
  }

  findById(id: string): Promise<ITask | null> {
    return this.repository.findOne({ where: { id } });
  }

  create(data: ICreateTaskInput): Promise<ITask> {
    const task = this.repository.create({
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? TaskStatus.TODO,
      dueDate: data.dueDate ?? null,
    });
    return this.repository.save(task);
  }

  async update(id: string, data: IUpdateTaskInput): Promise<ITask | null> {
    const task = await this.repository.findOne({ where: { id } });
    if (!task) {
      return null;
    }

    const updatedTask = this.repository.merge(task, data);
    return this.repository.save(updatedTask);
  }

  updateStatus(id: string, status: TaskStatus): Promise<ITask | null> {
    return this.update(id, { status });
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}