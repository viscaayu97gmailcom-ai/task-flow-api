
import {
  ICreateParticipantInput,
  IParticipant,
  IUpdateParticipantInput,
} from './participant.interface';

export interface IParticipantRepository {
  findAllByEvent(eventId: string): Promise<IParticipant[]>;

  findById(id: string): Promise<IParticipant | null>;

  create(data: ICreateParticipantInput): Promise<IParticipant>;

  update(
    id: string,
    data: IUpdateParticipantInput,
  ): Promise<IParticipant | null>;

  remove(id: string): Promise<boolean>;
}

export const PARTICIPANT_REPOSITORY = 'PARTICIPANT_REPOSITORY';
