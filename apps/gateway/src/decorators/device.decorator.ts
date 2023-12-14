import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const IsMobile = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const headers = request.headers;
    return headers['X-Mobile'];
  },
);
