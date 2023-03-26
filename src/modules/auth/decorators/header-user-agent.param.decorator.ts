import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const HeaderUserAgent = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.headers['user-agent'] || '';
});
