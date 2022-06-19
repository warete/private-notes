import { Controller, Get, Param, Post } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { NoteDocument } from './schemas/note.schema';
import { Public } from '../auth/public.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async list(
    @CurrentUser() currentUser: UserDocument,
  ): Promise<NoteDocument[]> {
    return this.notesService.getAllForUser(currentUser);
  }

  @Public()
  @Get('/:id')
  async detail(@Param('id') id: string): Promise<NoteDocument> {
    return this.notesService.getById(id);
  }

  @Post()
  async create(
    @CurrentUser() currentUser: UserDocument,
  ): Promise<NoteDocument> {
    const secretKey: string = this.notesService.getRandomKey();
    return this.notesService.createForUser('azaza', secretKey, currentUser);
  }
}
