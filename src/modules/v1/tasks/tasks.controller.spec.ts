import {
  ArgumentsHost,
  BadRequestException,
  ExecutionContext,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ITask,
  ITaskRepository,
  TASK_REPOSITORY,
  TaskStatus,
} from '../../../database/interfaces';
import {
  createPaginatedResult,
  HttpExceptionFilter,
  normalizePaginationQuery,
  RateLimiterGuard,
} from '../../../utils';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
describe('TasksController (v1)', () => {
  let controller: TasksController;
  let mockRepository: jest.Mocked<ITaskRepository>;

  const sampleTask: ITask = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Setup TypeORM migration',
    description: 'Configure MySQL and migrations',
    status: TaskStatus.TODO,
    dueDate: null,
    createdAt: new Date('2026-11-19T00:00:00.000Z'),
    updatedAt: new Date('2026-11-19T00:00:00.000Z'),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        {
          provide: TASK_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  describe('findAll', () => {
    it('returns paginated tasks with metadata', async () => {
      const paginated = createPaginatedResult([sampleTask], 15, 2, 5);
      mockRepository.findPaginated.mockResolvedValue(paginated);

      const response = await controller.findAll({
        page: 2,
        limit: 5,
        status: TaskStatus.TODO,
      });

      expect(response).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Tasks retrieved successfully',
        data: [sampleTask],
        meta: {
          page: 2,
          limit: 5,
          totalItems: 15,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      });
    });

    it('normalizes invalid pagination query defaults', () => {
      expect(
        normalizePaginationQuery({ page: '0', limit: '999', sortOrder: 'asc' }),
      ).toEqual({
        page: 1,
        limit: 100,
        skip: 0,
        take: 100,
        sortOrder: 'ASC',
      });
    });
  });

  describe('findById', () => {
    it('returns task when found', async () => {
      mockRepository.findById.mockResolvedValue(sampleTask);

      const response = await controller.findById(sampleTask.id);

      expect(response).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Task retrieved successfully',
        data: sampleTask,
      });
    });

    it('throws NotFoundException when missing', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(controller.findById(sampleTask.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a task and returns CREATED response', async () => {
      mockRepository.create.mockResolvedValue(sampleTask);

      const response = await controller.create({
        title: '  Setup TypeORM migration  ',
        description: 'Configure MySQL and migrations',
      });

      expect(response).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Task created successfully',
        data: sampleTask,
      });
    });

    it('throws BadRequestException when title is empty', async () => {
      await expect(controller.create({ title: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update & updateStatus', () => {
    it('updates task fields', async () => {
      const updated: ITask = { ...sampleTask, title: 'Updated task' };
      mockRepository.update.mockResolvedValue(updated);

      const response = await controller.update(sampleTask.id, {
        title: 'Updated task',
      });

      expect(response.data.title).toBe('Updated task');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates task status', async () => {
      const updated: ITask = { ...sampleTask, status: TaskStatus.IN_PROGRESS };
      mockRepository.updateStatus.mockResolvedValue(updated);

      const response = await controller.updateStatus(sampleTask.id, {
        status: TaskStatus.IN_PROGRESS,
      });

      expect(response.data.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('remove', () => {
    it('soft deletes task and returns deleted status', async () => {
      mockRepository.remove.mockResolvedValue(true);

      const response = await controller.remove(sampleTask.id);

      expect(response).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Task deleted successfully',
        data: {
          id: sampleTask.id,
          deleted: true,
        },
      });
    });
  });

  describe('RateLimiterGuard', () => {
    it('allows requests within limit and blocks when exceeded', () => {
      const guard = new RateLimiterGuard({ ttlMs: 60_000, max: 2 });
      const headers = new Map<string, string>();

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ ip: '127.0.0.1' }),
          getResponse: () => ({
            setHeader: (name: string, value: string) => {
              headers.set(name, value);
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
      expect(guard.canActivate(context)).toBe(true);
      expect(headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(() => guard.canActivate(context)).toThrow(HttpException);
    });
  });

  describe('HttpExceptionFilter', () => {
    it('formats validation array errors and unknown errors uniformly', () => {
      const filter = new HttpExceptionFilter();
      let capturedStatus = 0;
      let capturedBody: unknown;

      const host = {
        switchToHttp: () => ({
          getRequest: () => ({ url: '/v1/tasks' }),
          getResponse: () => ({
            status: (code: number) => {
              capturedStatus = code;
              return {
                json: (body: unknown) => {
                  capturedBody = body;
                },
              };
            },
          }),
        }),
      } as unknown as ArgumentsHost;

      filter.catch(
        new BadRequestException(['title should not be empty']),
        host,
      );
      expect(capturedStatus).toBe(HttpStatus.BAD_REQUEST);
      expect(capturedBody).toMatchObject({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: ['title should not be empty'],
        path: '/v1/tasks',
      });

      filter.catch(new Error('unexpected crash'), host);
      expect(capturedStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(capturedBody).toMatchObject({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: '/v1/tasks',
      });
    });
  });
});
