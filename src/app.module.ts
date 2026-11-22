
import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database';
import { TasksModule } from './modules/v1/tasks';
import { EventsModule } from './modules/events/events.module';
import { ParticipantsModule } from './modules/participants/participants.module';

import {
  HttpExceptionFilter,
  RATE_LIMITER_OPTIONS,
  RateLimiterGuard,
} from './utils';

@Module({
  imports: [
    DatabaseModule,
    TasksModule,
    EventsModule,
    ParticipantsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: RATE_LIMITER_OPTIONS,
      useValue: {
        ttlMs: Number(process.env.RATE_LIMIT_TTL_MS ?? 60_000),
        max: Number(process.env.RATE_LIMIT_MAX ?? 100),
      },
    },
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}
