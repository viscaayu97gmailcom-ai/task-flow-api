
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

import { EventsService } from './events.service';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindAllEventsQueryDto } from './dto/find-all-events-query.dto';

@Controller('v1/events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  async findAll(@Query() query: FindAllEventsQueryDto) {
    const result = await this.eventsService.findAll(query);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Events retrieved successfully',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const event = await this.eventsService.findById(id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Event retrieved successfully',
      data: event,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateEventDto) {
    const event = await this.eventsService.create(body);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Event created successfully',
      data: event,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateEventDto,
  ) {
    const event = await this.eventsService.update(id, body);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Event updated successfully',
      data: event,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.eventsService.remove(id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Event deleted successfully',
      data,
    };
  }
}
