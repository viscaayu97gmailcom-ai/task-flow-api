
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';

import {
  createPaginatedResult,
  IPaginatedResult,
  normalizePaginationQuery,
} from '../../utils/pagination.util';

import { Event } from '../entities/event.entity';
import { EventStatus } from '../enums/event-status.enum';

import {
  IEventPaginationQuery,
  IEventRepository,
  EventSortField,
} from '../interfaces/event-repository.interface';

import {
  ICreateEventInput,
  IEvent,
  IUpdateEventInput,
} from '../interfaces/event.interface';

export type CreateEventData = ICreateEventInput;
export type UpdateEventData = IUpdateEventInput;

const ALLOWED_SORT_FIELDS: readonly EventSortField[] = [
  'createdAt',
  'updatedAt',
  'startDate',
  'endDate',
  'name',
  'status',
];

@Injectable()
export class EventRepository implements IEventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}

  findAll(status?: EventStatus): Promise<IEvent[]> {
    return this.repository.find({
      where: status ? { status } : undefined,
      order: { createdAt: 'DESC' },
    });
  }

  async findPaginated(
    query: IEventPaginationQuery = {},
  ): Promise<IPaginatedResult<IEvent>> {
    const { page, limit, skip, take, sortOrder } =
      normalizePaginationQuery(query);

    const sortBy: EventSortField =
      query.sortBy && ALLOWED_SORT_FIELDS.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';

    const keyword = query.search?.trim();

    let where:
      | FindOptionsWhere<Event>
      | FindOptionsWhere<Event>[]
      | undefined;

    if (keyword) {
      const baseCondition: FindOptionsWhere<Event> = query.status
        ? { status: query.status }
        : {};

      where = [
        { ...baseCondition, name: Like(`%${keyword}%`) },
        { ...baseCondition, description: Like(`%${keyword}%`) },
        { ...baseCondition, location: Like(`%${keyword}%`) },
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

    return createPaginatedResult(
      items,
      totalItems,
      page,
      limit,
    );
  }

  findById(id: string): Promise<IEvent | null> {
    return this.repository.findOne({
      where: { id },
      relations: { participants: true },
    });
  }

  create(data: ICreateEventInput): Promise<IEvent> {
    const event = this.repository.create({
      name: data.name,
      description: data.description ?? null,
      location: data.location,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status ?? EventStatus.PLANNED,
    });

    return this.repository.save(event);
  }

  async update(
    id: string,
    data: IUpdateEventInput,
  ): Promise<IEvent | null> {
    const event = await this.repository.findOne({
      where: { id },
    });

    if (!event) {
      return null;
    }

    const updatedEvent = this.repository.merge(event, data);

    return this.repository.save(updatedEvent);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);

    return (result.affected ?? 0) > 0;
  }
}
