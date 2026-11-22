import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreateTaskDto,
  CreateTaskResponseDto,
  DeleteTaskResponseDto,
  FindAllTasksQueryDto,
  FindAllTasksResponseDto,
  FindTaskByIdResponseDto,
  UpdateTaskDto,
  UpdateTaskResponseDto,
  UpdateTaskStatusDto,
} from './dto';
import { TasksService } from './tasks.service';

@Controller('v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @Query() query: FindAllTasksQueryDto,
  ): Promise<FindAllTasksResponseDto> {
    const result = await this.tasksService.findAll(query);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Tasks retrieved successfully',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FindTaskByIdResponseDto> {
    const task = await this.tasksService.findById(id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Task retrieved successfully',
      data: task,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateTaskDto): Promise<CreateTaskResponseDto> {
    const task = await this.tasksService.create(body);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Task created successfully',
      data: task,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTaskDto,
  ): Promise<UpdateTaskResponseDto> {
    const task = await this.tasksService.update(id, body);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Task updated successfully',
      data: task,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTaskStatusDto,
  ): Promise<UpdateTaskResponseDto> {
    const task = await this.tasksService.updateStatus(id, body);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Task status updated successfully',
      data: task,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteTaskResponseDto> {
    const data = await this.tasksService.remove(id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Task deleted successfully',
      data,
    };
  }
}