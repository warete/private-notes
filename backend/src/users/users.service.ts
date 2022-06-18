import { Injectable } from '@nestjs/common';

//TODO: вынести в модель и БД
export class User {
  constructor(
    public id: number,
    public username: string,
    public password: string, //TODO: хэш
  ) {}
}

@Injectable()
export class UsersService {
  private users = [new User(1, 'admin', 'admin')];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async comparePasswords(
    userPassword: string,
    inputPassword: string,
  ): Promise<boolean> {
    //TODO: хэширование и сравнение хэшей
    return userPassword === inputPassword;
  }
}
