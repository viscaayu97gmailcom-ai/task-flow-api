
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { ParticipantsService } from './participants.service';

import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@Controller('v1/participants')
export class ParticipantsController {
  constructor(
    private readonly participantsService: ParticipantsService,
  ) {}

  @Get('event/:eventId')
  async findAllByEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    const participants =
      await this.participantsService.findAllByEvent(eventId);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Participants retrieved successfully',
      data: participants,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const participant =
      await this.participantsService.findById(id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Participant retrieved successfully',
      data: participant,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateParticipantDto) {
    const participant =
      await this.participantsService.create(body);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Participant created successfully',
      data: participant,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateParticipantDto,
  ) {
    const participant =
      await this.participantsService.update(id, body);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Participant updated successfully',
      data: participant,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.participantsService.remove(id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Participant deleted successfully',
      data,
    };
  }
}
