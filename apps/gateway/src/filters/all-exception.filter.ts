import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ErrorMessageEnum, HttpStatusCodeEnum } from 'src/shared';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly __configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    try {
      const status =
        exception.getStatus() || HttpStatusCodeEnum.InternalServerError;
      const message =
        exception?.response?.message ||
        exception?.message ||
        ErrorMessageEnum.INTERNAL_SERVER_ERROR;

      return response.status(status).json({
        status: 'error',
        message,
        data: null,
      });
    } catch (error) {
      console.log(error);
      return response.status(HttpStatusCodeEnum.InternalServerError).json({
        status: 'error',
        message: ErrorMessageEnum.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }
}
