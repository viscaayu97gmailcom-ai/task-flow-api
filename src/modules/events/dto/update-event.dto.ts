
import { EventStatus } from '../../../database/enums/event-status.enum';

export class UpdateEventDto {
  name?: string;
  description?: string | null;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: EventStatus;
}
