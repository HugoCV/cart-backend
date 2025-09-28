import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

type UserPayload = Omit<User, 'password'>;

interface RequestWithUser extends Request {
  user: UserPayload;
}

const getCurrentUserByContext = (context: ExecutionContext): UserPayload => {
  return context.switchToHttp().getRequest<RequestWithUser>().user;
};

export const currentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
