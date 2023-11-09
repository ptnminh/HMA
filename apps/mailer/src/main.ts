import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          'amqps://zwhbnmku:w_XDp3N5qASxWXSmz6O8_sE3flzQMrYf@octopus.rmq3.cloudamqp.com/zwhbnmku',
        ],
        queue: 'mail',
        noAck: false,
        prefetchCount: 2,
        queueOptions: {
          durable: false,
        },
      },
    },
  );
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
  await app.listen();
}
bootstrap();
