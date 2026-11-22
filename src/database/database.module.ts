import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptions } from './data-source';

import { Task } from './entities/task.entity';
import { Event } from './entities/event.entity';
import { Participant } from './entities/participant.entity';

import { TaskRepository } from './repositories/task.repository';
import { TASK_REPOSITORY } from './interfaces/task-repository.interface';

import { EventRepository } from './repositories/event.repository';
import { ParticipantRepository } from './repositories/participant.repository';

import { EVENT_REPOSITORY } from './interfaces/event-repository.interface';
import { PARTICIPANT_REPOSITORY } from './interfaces/participant-repository.interface';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([
      Task,
      Event,
      Participant,
    ]),
  ],
 providers: [
  TaskRepository,
  EventRepository,
  ParticipantRepository,

  {
    provide: TASK_REPOSITORY,
    useExisting: TaskRepository,
  },
  {
    provide: EVENT_REPOSITORY,
    useExisting: EventRepository,
  },
  {
    provide: PARTICIPANT_REPOSITORY,
    useExisting: ParticipantRepository,
  },
],

exports: [
  TypeOrmModule,
  TaskRepository,
  EventRepository,
  ParticipantRepository,
  TASK_REPOSITORY,
  EVENT_REPOSITORY,
  PARTICIPANT_REPOSITORY,
],
})
export class DatabaseModule {}