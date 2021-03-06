import { ApiProperty } from '@nestjs/swagger';

export class DecryptedNoteDto {
  constructor(partial: Partial<DecryptedNoteDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  body: string;
}
