import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter, ResponseInterceptor } from './interceptor';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

function configureSwagger(app): void {
  const config = new DocumentBuilder()
    .setTitle('notification-service')
    .setDescription('API Description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);
}

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(express()),
    {
      bufferLogs: true,
      cors: true,
    },
  );
  app.setGlobalPrefix('/api');
  app.use(helmet());
  const configService = app.get(ConfigService);
  const moduleRef = app.select(AppModule);
  const reflector = moduleRef.get(Reflector);
  app.useGlobalInterceptors(
    new ResponseInterceptor(reflector),
    new ClassSerializerInterceptor(reflector),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  configureSwagger(app);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [`${configService.get('RABBITMQ_URL')}`],
      queue: `${configService.get('RABBITMQ_NOTIFICATION_QUEUE')}`,
      queueOptions: { durable: false },
      prefetchCount: 2,
      noAck: false,
    },
  });
  await app.startAllMicroservices();
  await app.listen(8008);
  logger.log(
    `🚀 Notification service started successfully on port ${configService.get(
      'PORT',
    )}: http://localhost:${8008}/api/docs`,
  );
}
bootstrap();
