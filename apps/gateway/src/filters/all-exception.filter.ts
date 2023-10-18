import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import moment from 'moment-timezone';
import {
  ErrorMessageEnum,
  FormatTimeEnum,
  HttpStatusCodeEnum,
} from 'src/shared';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private __timezone: string;

  constructor(private readonly __configService: ConfigService) {
    this.__timezone = this.__configService.getOrThrow<string>('app.timezone');
  }

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
        success: false,
        message,
        timestamp: moment()
          .tz(this.__timezone)
          .format(FormatTimeEnum.DATE_TIME),
      });
    } catch (error) {
      return response.status(HttpStatusCodeEnum.InternalServerError).json({
        success: false,
        message: ErrorMessageEnum.INTERNAL_SERVER_ERROR,
        timestamp: moment()
          .tz(this.__timezone)
          .format(FormatTimeEnum.DATE_TIME),
      });
    }
  }
}
