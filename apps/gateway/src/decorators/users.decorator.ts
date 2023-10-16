import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  }
);

export const CurrentGuest = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    try {
      const request = ctx.switchToHttp().getRequest();
      return request.guestId;
    } catch (error) {
      console.log('@@@', error);
    }
  }
);
