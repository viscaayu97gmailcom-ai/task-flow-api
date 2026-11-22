
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  EVENT_REPOSITORY,
} from '../../database/interfaces/event-repository.interface';

import type {
  IEventRepository,
} from '../../database/interfaces/event-repository.interface';

import {
  EventStatus,
} from '../../database/enums/event-status.enum';

import type {
  ICreateEventInput,
  IEvent,
  IUpdateEventInput,
} from '../../database/interfaces/event.interface';

import type {
  IPaginatedResult,
} from '../../utils/pagination.util';

import {
  CreateEventDto,
} from './dto/create-event.dto';

import {
  UpdateEventDto,
} from './dto/update-event.dto';

import {
  FindAllEventsQueryDto,
} from './dto/find-all-events-query.dto';

import {
  DeleteEventDataDto,
} from './dto/delete-event-data.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  findAll(
    query: FindAllEventsQueryDto = {},
  ): Promise<IPaginatedResult<IEvent>> {
    const normalizedQuery = { ...query };

    if (
      normalizedQuery.status !== undefined &&
      String(normalizedQuery.status) !== ''
    ) {
      normalizedQuery.status = this.validateStatus(
        normalizedQuery.status,
      );
    } else {
      delete normalizedQuery.status;
    }

    return this.eventRepository.findPaginated(normalizedQuery);
  }

  async findById(id: string): Promise<IEvent> {
    const event = await this.eventRepository.findById(id);

    if (!event) {
      throw new NotFoundException(
        `Event with ID "${id}" not found`,
      );
    }

    return event;
  }

  create(payload: CreateEventDto): Promise<IEvent> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException(
        'Request body must be a JSON object',
      );
    }

    const input: ICreateEventInput = {
      name: this.validateName(payload.name),
      description: this.validateDescription(payload.description),
      location: this.validateLocation(payload.location),
      startDate: this.parseDate(payload.startDate, 'startDate'),
      endDate: this.parseDate(payload.endDate, 'endDate'),
      status:
        payload.status !== undefined
          ? this.validateStatus(payload.status)
          : EventStatus.PLANNED,
    };

    this.validateEventDates(input.startDate, input.endDate);

    return this.eventRepository.create(input);
  }

  async update(
    id: string,
    payload: UpdateEventDto,
  ): Promise<IEvent> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException(
        'Request body must be a JSON object',
      );
    }

    const input: IUpdateEventInput = {};

    if (payload.name !== undefined) {
      input.name = this.validateName(payload.name);
    }

    if (payload.description !== undefined) {
      input.description = this.validateDescription(
        payload.description,
      );
    }

    if (payload.location !== undefined) {
      input.location = this.validateLocation(payload.location);
    }

    if (payload.startDate !== undefined) {
      input.startDate = this.parseDate(
        payload.startDate,
        'startDate',
      );
    }

    if (payload.endDate !== undefined) {
      input.endDate = this.parseDate(
        payload.endDate,
        'endDate',
      );
    }

    if (payload.status !== undefined) {
      input.status = this.validateStatus(payload.status);
    }

    const existingEvent = await this.eventRepository.findById(id);

    if (!existingEvent) {
      throw new NotFoundException(
        `Event with ID "${id}" not found`,
      );
    }

    const finalStartDate =
      input.startDate ?? existingEvent.startDate;

    const finalEndDate =
      input.endDate ?? existingEvent.endDate;

    this.validateEventDates(finalStartDate, finalEndDate);

    const updated = await this.eventRepository.update(id, input);

    if (!updated) {
      throw new NotFoundException(
        `Event with ID "${id}" not found`,
      );
    }

    return updated;
  }

  async remove(id: string): Promise<DeleteEventDataDto> {
    const deleted = await this.eventRepository.remove(id);

    if (!deleted) {
      throw new NotFoundException(
        `Event with ID "${id}" not found`,
      );
    }

    return {
      id,
      deleted: true,
    };
  }

  private validateName(name: unknown): string {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestException(
        'name must be a non-empty string',
      );
    }

    const trimmed = name.trim();

    if (trimmed.length > 150) {
      throw new BadRequestException(
        'name must not exceed 150 characters',
      );
    }

    return trimmed;
  }

  private validateDescription(
    description: unknown,
  ): string | null | undefined {
    if (description === undefined || description === null) {
      return description;
    }

    if (typeof description !== 'string') {
      throw new BadRequestException(
        'description must be a string or null',
      );
    }

    return description;
  }

  private validateLocation(location: unknown): string {
    if (
      typeof location !== 'string' ||
      location.trim().length === 0
    ) {
      throw new BadRequestException(
        'location must be a non-empty string',
      );
    }

    const trimmed = location.trim();

    if (trimmed.length > 200) {
      throw new BadRequestException(
        'location must not exceed 200 characters',
      );
    }

    return trimmed;
  }

  private validateStatus(status: unknown): EventStatus {
    if (
      typeof status !== 'string' ||
      !Object.values(EventStatus).includes(status as EventStatus)
    ) {
      throw new BadRequestException(
        `status must be one of: ${Object.values(EventStatus).join(', ')}`,
      );
    }

    return status as EventStatus;
  }

  private parseDate(value: unknown, field: string): Date {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(
        `${field} must be a valid date string`,
      );
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(
        `${field} must be a valid ISO date string`,
      );
    }

    return parsed;
  }

  private validateEventDates(
    startDate: Date,
    endDate: Date,
  ): void {
    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException(
        'endDate cannot be earlier than startDate',
      );
    }
  }
}
