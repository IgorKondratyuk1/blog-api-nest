import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTokenPayload = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  if (!request.user?.userId || !request.user?.deviceId || !request.user?.lastActiveDate)
    throw new Error('CurrentTokenPayload (Check JwtGuards decorator. No user data in request)');
  return request.user;
});
