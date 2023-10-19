import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://user:password@localhost:5672'],
      queue: 'mail',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.listen();
}
bootstrap();
