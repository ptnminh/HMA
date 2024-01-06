import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
export declare class AllExceptionFilter implements ExceptionFilter {
    private readonly __configService;
    constructor(__configService: ConfigService);
    catch(exception: any, host: ArgumentsHost): Response<any, Record<string, any>>;
}
