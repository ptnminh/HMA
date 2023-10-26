import { NestFactory } from '@nestjs/core';
import { Transport, TcpOptions } from '@nestjs/microservices';
import { CloudinaryModule } from './cloudinary.module';
import { Logger } from '@nestjs/common';
import { config } from './configs';
async function bootstrap() {
  const configs = config();
  const app = await NestFactory.createMicroservice(CloudinaryModule, {
    transport: Transport.TCP,
    options: {
      host: configs.app.host,
      port: configs.app.port,
    },
  } as TcpOptions);
  Logger.log(`Service is running on PORT ${configs.app.port}`);
  await app.listen();
}
bootstrap();
