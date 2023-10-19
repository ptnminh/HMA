import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  const configService = app.get(ConfigService);
  const options = new DocumentBuilder()
    .setTitle('API docs')
    .setVersion('1.0')
    .build();
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
            errors: true,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
      transform: true,
      stopAtFirstError: true,
    }),
  );
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/v1/swagger', app, document);
  await app.listen(configService.get('PORT'));
  console.log(`Swagger is running on: ${await app.getUrl()}/api/v1/swagger`);
}
bootstrap();
