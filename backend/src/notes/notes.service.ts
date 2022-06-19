import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note as NoteModel, NoteDocument } from './schemas/note.schema';
import { UserDto } from '../users/users.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(NoteModel.name) private noteModel: Model<NoteDocument>,
  ) {}

  async getAllForUser(user: UserDto): Promise<NoteDocument[]> {
    return this.noteModel.find({ user: user.id }).exec();
  }
}
