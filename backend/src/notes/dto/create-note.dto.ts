import { IsDate, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  constructor(partial: Partial<CreateNoteDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsDate()
  dateExpire: Date;
}
