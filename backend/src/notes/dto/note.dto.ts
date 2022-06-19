import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class NoteDto {
  constructor(partial: Partial<NoteDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @Exclude()
  body: string;

  @ApiProperty()
  dateExpire: Date;

  @ApiProperty()
  readAttemptsCount: number;
}
