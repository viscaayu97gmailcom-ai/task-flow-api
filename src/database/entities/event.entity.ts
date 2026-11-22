
import {
  Column,
  Entity,
  Index,
  OneToMany,
} from 'typeorm';

import { EventStatus } from '../enums/event-status.enum';
import { IEvent } from '../interfaces/event.interface';
import { BaseEntity } from './base.entity';
import { Participant } from './participant.entity';

@Entity({ name: 'events' })
export class Event extends BaseEntity implements IEvent {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 200 })
  location!: string;

  @Column({ name: 'start_date', type: 'datetime' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'datetime' })
  endDate!: Date;

  @Index('IDX_events_status')
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PLANNED,
  })
  status!: EventStatus;

  @OneToMany(
    () => Participant,
    (participant) => participant.event,
  )
  participants!: Participant[];
}
