
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Participant } from '../entities/participant.entity';
import { Event } from '../entities/event.entity';

import {
  IParticipantRepository,
} from '../interfaces/participant-repository.interface';

import {
  ICreateParticipantInput,
  IParticipant,
  IUpdateParticipantInput,
} from '../interfaces/participant.interface';

@Injectable()
export class ParticipantRepository
  implements IParticipantRepository
{
  constructor(
    @InjectRepository(Participant)
    private readonly repository: Repository<Participant>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  findAllByEvent(eventId: string): Promise<IParticipant[]> {
    return this.repository.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<IParticipant | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async create(
    data: ICreateParticipantInput,
  ): Promise<IParticipant> {
    const event = await this.eventRepository.findOne({
      where: { id: data.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event tidak ditemukan');
    }

    const participant = this.repository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      event,
    });

    return this.repository.save(participant);
  }

  async update(
    id: string,
    data: IUpdateParticipantInput,
  ): Promise<IParticipant | null> {
    const participant = await this.repository.findOne({
      where: { id },
    });

    if (!participant) {
      return null;
    }

    const { eventId, ...participantData } = data;

    this.repository.merge(participant, participantData);

    if (eventId !== undefined) {
      const event = await this.eventRepository.findOne({
        where: { id: eventId },
      });

      if (!event) {
        throw new NotFoundException('Event tidak ditemukan');
      }

      participant.event = event;
    }

    return this.repository.save(participant);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);

    return (result.affected ?? 0) > 0;
  }
}
