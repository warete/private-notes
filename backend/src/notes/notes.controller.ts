import {
  BadRequestException,
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
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateNoteDto } from './dto/create-note.dto';

@ApiTags('notes')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('notes')
export class NotesController {
  private readonly logger = new Logger(NotesController.name);
  constructor(private readonly notesService: NotesService) {}

  @ApiBearerAuth()
  @Get()
  @ApiOkResponse({
    type: [NoteDto],
  })
  @ApiOperation({ description: 'Notes for current user' })
  async list(@CurrentUser() currentUser: UserDocument): Promise<NoteDto[]> {
    const notes = await this.notesService.getAllForUser(currentUser);
    return notes.map((item) => this.notesService.documentToDto(item));
  }

  @Public()
  @Get('/:id')
  @ApiOkResponse({
    type: NoteDto,
  })
  @ApiNotFoundResponse()
  async detail(@Param('id') id: string): Promise<NoteDto> {
    const note: NoteDocument = await this.notesService.getById(id);
    if (!note || !note.body) {
      throw new NotFoundException();
    }
    return this.notesService.documentToDto(note);
  }

  @Public()
  @Get('/:id/decrypt/')
  @ApiOkResponse({
    type: DecryptedNoteDto,
  })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async decryptById(
    @Param('id') id: string,
    @Query('key') key: string,
    @IpAddress() userIp: string,
  ): Promise<DecryptedNoteDto> {
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

  @ApiBearerAuth()
  @Post()
  @ApiOkResponse({
    type: NoteDto,
  })
  async create(
    @CurrentUser() currentUser: UserDocument,
    @Body() createNote: CreateNoteDto,
  ): Promise<NoteDto> {
    if (!createNote.text.length) {
      throw new BadRequestException('Empty text');
    }
    if (!createNote.dateExpire) {
      throw new BadRequestException('Empty dateExpire');
    }
    const secretKey: string = this.notesService.getRandomKey();
    //TODO: send sms or email
    console.log(secretKey);
    return this.notesService.documentToDto(
      await this.notesService.createForUser(
        createNote.text,
        createNote.dateExpire,
        secretKey,
        currentUser,
      ),
    );
  }
}
