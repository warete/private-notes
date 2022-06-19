import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { NoteDto } from './dto/note.dto';
import { NoteDocument } from './schemas/note.schema';
import { DecryptedNoteDto } from './dto/decrypted-note.dto';
import { IpAddress } from '../ip-address.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('notes')
export class NotesController {
  private readonly logger = new Logger(NotesController.name);
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async list(@CurrentUser() currentUser: UserDocument): Promise<NoteDto[]> {
    const notes = await this.notesService.getAllForUser(currentUser);
    return notes.map((item) => this.notesService.documentToDto(item));
  }

  @Public()
  @Get('/:id')
  async detail(@Param('id') id: string): Promise<NoteDto> {
    const note: NoteDocument = await this.notesService.getById(id);
    if (!note || !note.body) {
      throw new NotFoundException();
    }
    return this.notesService.documentToDto(note);
  }

  @Public()
  @Get('/:id/decrypt/')
  async decryptById(
    @Param('id') id: string,
    @Query('key') key: string,
    @IpAddress() userIp: string,
  ): Promise<any> {
    const note: NoteDocument = await this.notesService.getById(id);
    if (!note || !note.body) {
      throw new NotFoundException();
    }
    const decryptedBody: string = await this.notesService.decryptBody(
      note.body,
      key,
    );
    const encryptedTmp: string = await this.notesService.cryptBody(
      decryptedBody,
      key,
    );
    if (note.body !== encryptedTmp) {
      note.readAttemptsCount++;
      if (note.readAttemptsCount > 3) {
        note.body = null;
      }
      this.logger.warn(
        'User try to decrypt note. User info: ' +
          JSON.stringify({ ip: userIp }),
      );
      await this.notesService.update(note);
      throw new ForbiddenException();
    }
    note.body = null;
    await this.notesService.update(note);
    return new DecryptedNoteDto({
      id: note.id,
      body: decryptedBody,
    });
  }

  @Post()
  async create(
    @CurrentUser() currentUser: UserDocument,
    @Body('text') text: string,
    @Body('dateExpire') dateExpire: Date,
  ): Promise<NoteDto> {
    const secretKey: string = this.notesService.getRandomKey();
    //TODO: send sms or email
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
