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


      const data =
        exception?.response?.data ||
        exception?.data ||
        null;

      return response.status(status).json({
        status: false,
        message,
        data,
      });
    } catch (error) {
      console.log(error);
      return response.status(HttpStatusCodeEnum.InternalServerError).json({
        status: false,
        message: ErrorMessageEnum.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }
}
