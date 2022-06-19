import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type NoteDocument = Note & Document;

@Schema()
export class Note {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  body: string;

  @Prop({ type: Date })
  dateExpire: Date;

  @Prop({ default: 0 })
  readAttemptsCount: number;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
