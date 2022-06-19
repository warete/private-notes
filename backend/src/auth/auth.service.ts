import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<UserDocument> {
    const user = await this.userService.findOne(username);
    if (
      user &&
      (await this.userService.comparePasswords(user.password, pass))
    ) {
      return user;
    }
    return null;
  }

  async login(user: UserDocument) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, pass: string): Promise<UserDocument> {
    return this.userService.register(username, pass);
  }
}
