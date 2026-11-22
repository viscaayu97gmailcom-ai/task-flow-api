
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PARTICIPANT_REPOSITORY,
} from '../../database/interfaces/participant-repository.interface';

import type {
  IParticipantRepository,
} from '../../database/interfaces/participant-repository.interface';

import type {
  ICreateParticipantInput,
  IParticipant,
  IUpdateParticipantInput,
} from '../../database/interfaces/participant.interface';

import {
  CreateParticipantDto,
} from './dto/create-participant.dto';

import {
  UpdateParticipantDto,
} from './dto/update-participant.dto';

import {
  DeleteParticipantDataDto,
} from './dto/delete-participant-data.dto';

@Injectable()
export class ParticipantsService {
  constructor(
    @Inject(PARTICIPANT_REPOSITORY)
    private readonly participantRepository: IParticipantRepository,
  ) {}

  findAllByEvent(eventId: string): Promise<IParticipant[]> {
    return this.participantRepository.findAllByEvent(eventId);
  }

  async findById(id: string): Promise<IParticipant> {
    const participant = await this.participantRepository.findById(id);

    if (!participant) {
      throw new NotFoundException(
        `Participant with ID "${id}" not found`,
      );
    }

    return participant;
  }

  create(payload: CreateParticipantDto): Promise<IParticipant> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException(
        'Request body must be a JSON object',
      );
    }

    const input: ICreateParticipantInput = {
      name: this.validateName(payload.name),
      email: this.validateEmail(payload.email),
      phone: this.validatePhone(payload.phone),
      eventId: this.validateEventId(payload.eventId),
    };

    return this.participantRepository.create(input);
  }

  async update(
    id: string,
    payload: UpdateParticipantDto,
  ): Promise<IParticipant> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException(
        'Request body must be a JSON object',
      );
    }

    const input: IUpdateParticipantInput = {};

    if (payload.name !== undefined) {
      input.name = this.validateName(payload.name);
    }

    if (payload.email !== undefined) {
      input.email = this.validateEmail(payload.email);
    }

    if (payload.phone !== undefined) {
      input.phone = this.validatePhone(payload.phone);
    }

    if (payload.eventId !== undefined) {
      input.eventId = this.validateEventId(payload.eventId);
    }

    const updated = await this.participantRepository.update(id, input);

    if (!updated) {
      throw new NotFoundException(
        `Participant with ID "${id}" not found`,
      );
    }

    return updated;
  }

  async remove(id: string): Promise<DeleteParticipantDataDto> {
    const deleted = await this.participantRepository.remove(id);

    if (!deleted) {
      throw new NotFoundException(
        `Participant with ID "${id}" not found`,
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

  private validateEmail(email: unknown): string {
    if (typeof email !== 'string' || email.trim().length === 0) {
      throw new BadRequestException(
        'email must be a non-empty string',
      );
    }

    const trimmed = email.trim();

    if (
      trimmed.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    ) {
      throw new BadRequestException(
        'email must be a valid email address (maximum 150 characters)',
      );
    }

    return trimmed;
  }

  private validatePhone(phone: unknown): string {
    if (typeof phone !== 'string' || phone.trim().length === 0) {
      throw new BadRequestException(
        'phone must be a non-empty string',
      );
    }

    const trimmed = phone.trim();

    if (trimmed.length > 20) {
      throw new BadRequestException(
        'phone must not exceed 20 characters',
      );
    }

    return trimmed;
  }

  private validateEventId(eventId: unknown): string {
    if (
      typeof eventId !== 'string' ||
      eventId.trim().length === 0
    ) {
      throw new BadRequestException(
        'eventId must be a non-empty string',
      );
    }

    return eventId.trim();
  }
}
