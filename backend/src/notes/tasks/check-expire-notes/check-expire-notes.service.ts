import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotesService } from '../../notes.service';

@Injectable()
export class CheckExpireNotesService {
  private readonly logger = new Logger(CheckExpireNotesService.name);

  constructor(private readonly notesService: NotesService) {}

  @Cron('0 * * * * *')
  async handleCron() {
    this.logger.debug('Start task');
    (await this.notesService.getExpiredList()).forEach((item) => {
      this.logger.debug('Deleting body in note with id ' + item.id);
      item.body = null;
      this.notesService.update(item);
    });
    this.logger.debug('End task');
  }
}
