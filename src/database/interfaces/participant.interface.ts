
import { IBaseEntity } from './base-entity.interface';

export interface IParticipant extends IBaseEntity {
  name: string;
  email: string;
  phone: string;
  eventId: string;
}

export interface ICreateParticipantInput {
  name: string;
  email: string;
  phone: string;
  eventId: string;
}

export type IUpdateParticipantInput =
  Partial<ICreateParticipantInput>;
