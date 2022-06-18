import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User as UserModel, UserDocument } from './schemas/user.schema';

//TODO: вынести в модель и БД
export class User {
  constructor(
    public id: string,
    public username: string,
    public password: string, //TODO: хэш
  ) {}
}

export class UserDto {
  constructor(public id: string, public username: string) {}
}

export const hashRounds = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({
        username: username,
      })
      .exec();
    return user ? new User(user._id, user.username, user.password) : null;
  }

  async register(username, password): Promise<User> {
    if (await this.findOne(username)) {
      throw new HttpException(
        'Пользователь уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModel.create({
      username,
      password: await this.getHashByPassword(password),
    });

    return new User(user._id, user.username, user.password);
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
