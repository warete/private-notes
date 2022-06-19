import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  access_token: string;
}
