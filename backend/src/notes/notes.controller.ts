import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { NoteDto } from './dto/note.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async list(@CurrentUser() currentUser: UserDocument): Promise<NoteDto[]> {
    const notes = await this.notesService.getAllForUser(currentUser);
    return notes.map((item) => this.notesService.documentToDto(item));
  }

  @Public()
  @Get('/:id')
  async detail(@Param('id') id: string): Promise<NoteDto> {
    return this.notesService.documentToDto(await this.notesService.getById(id));
  }

  @Post()
  async create(
    @CurrentUser() currentUser: UserDocument,
    @Body('text') text: string,
    @Body('dateExpire') dateExpire: Date,
  ): Promise<NoteDto> {
    const secretKey: string = this.notesService.getRandomKey();
    console.log(secretKey);
    return this.notesService.documentToDto(
      await this.notesService.createForUser(
        text,
        dateExpire,
        secretKey,
        currentUser,
      ),
    );
  }
}
