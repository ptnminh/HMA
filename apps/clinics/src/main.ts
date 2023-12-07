import { NestFactory } from '@nestjs/core';
import { Transport, TcpOptions } from '@nestjs/microservices';
import { ClinicModule } from './clinics/clinics.module';
import {
  HttpException,
  HttpStatus,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { config } from './configs';

async function bootstrap() {
  const configs = config();
  const app = await NestFactory.createMicroservice(ClinicModule, {
    transport: Transport.TCP,
    options: {
      host: configs.app.host,
      port: configs.app.port,
    },
  } as TcpOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        throw new HttpException(
          {
            message: result[0].message,
            data: null,
            status: false,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
      transform: true,
      stopAtFirstError: true,
    }),
  );
  Logger.log(`Service is running on PORT ${configs.app.port}`);
  await app.listen();
}
bootstrap();
