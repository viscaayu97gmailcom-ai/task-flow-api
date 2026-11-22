
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  RelationId,
} from 'typeorm';

import { IParticipant } from '../interfaces/participant.interface';
import { BaseEntity } from './base.entity';
import { Event } from './event.entity';

@Entity({ name: 'participants' })
export class Participant
  extends BaseEntity
  implements IParticipant
{
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 150 })
  email!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @ManyToOne(
    () => Event,
    (event) => event.participants,
  )
  @JoinColumn({ name: 'event_id' })
  event!: Event;

  @RelationId((participant: Participant) => participant.event)
  eventId!: string;
}
