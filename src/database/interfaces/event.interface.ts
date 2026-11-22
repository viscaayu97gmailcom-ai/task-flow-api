
import { EventStatus } from '../enums/event-status.enum';
import { IBaseEntity } from './base-entity.interface';

export interface IEvent extends IBaseEntity {
  name: string;
  description: string | null;
  location: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
}

export interface ICreateEventInput {
  name: string;
  description?: string | null;
  location: string;
  startDate: Date;
  endDate: Date;
  status?: EventStatus;
}

export type IUpdateEventInput = Partial<ICreateEventInput>;
