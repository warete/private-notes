import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { CredentialsDto } from './dto/credentials.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  async login(
    @Request() req,
    @Body() body: CredentialsDto,
  ): Promise<LoginResponseDto> {
    return new LoginResponseDto({
      ...(await this.authService.login(req.user)),
    });
  }

  @Public()
  @Post('register')
  @ApiOkResponse({
    type: UserResponseDto,
  })
  async register(@Body() body: CredentialsDto): Promise<UserResponseDto> {
    return new UserResponseDto({
      ...(await this.authService.register(body.username, body.password)),
    });
  }

  @ApiBearerAuth()
  @Get('profile')
  @ApiOkResponse({
    type: UserResponseDto,
  })
  async profile(@Request() req): Promise<UserResponseDto> {
    return new UserResponseDto({ ...req.user });
  }
}
