import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './schemas/note.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { CheckExpireNotesService } from './tasks/check-expire-notes/check-expire-notes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ScheduleModule.forRoot(),
  ],
  providers: [NotesService, CheckExpireNotesService],
  controllers: [NotesController],
})
export class NotesModule {}
