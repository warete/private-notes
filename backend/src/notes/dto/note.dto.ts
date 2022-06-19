import { Exclude } from 'class-transformer';

export class NoteDto {
  constructor(partial: Partial<NoteDto>) {
    Object.assign(this, partial);
  }

  id: string;
  @Exclude()
  body: string;
  dateExpire: Date;
  readAttemptsCount: number;
}
