import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  if (!request.user)
    throw new Error('CurrentUserIdDecorator (Check LocalJwtGuard decorator. No user in request)');
  return request.user.userId;
});
