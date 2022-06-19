import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '../users/users.service';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const user: UserDto = ctx.switchToHttp().getRequest().user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user; // extract a specific property only if specified or get a user object
  },
);
