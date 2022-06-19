import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User as UserModel, UserDocument } from './schemas/user.schema';

export const hashRounds = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
  ) {}

  async findOne(username: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        username: username,
      })
      .exec();
  }

  async register(username, password): Promise<UserDocument> {
    if (await this.findOne(username)) {
      throw new HttpException(
        'Пользователь уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.userModel.create({
      username,
      password: await this.getHashByPassword(password),
    });
  }

  async comparePasswords(
    userHash: string,
    inputPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, userHash);
  }

  async getHashByPassword(pass: string): Promise<string> {
    return bcrypt.hash(pass, hashRounds);
  }
}
