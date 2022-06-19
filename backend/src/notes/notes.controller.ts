import { Controller, Get } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserDto } from '../users/users.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async list(@CurrentUser() currentUser: UserDto) {
    return this.notesService.getAllForUser(currentUser);
  }
}
