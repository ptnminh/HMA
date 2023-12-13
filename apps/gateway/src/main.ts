import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { join, resolve } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  const configService = app.get(ConfigService);
  const options = new DocumentBuilder()
    .setTitle('API docs')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        schema: 'Bearer',
        bearerFormat: 'Token',
      } as SecuritySchemeObject,
      'Bearer',
    )
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
            status: false,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.useStaticAssets(resolve('./src/public'));
  app.setBaseViewsDir(resolve('./src/views'));
  app.setViewEngine('hbs');
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/swagger', app, document);
  await app.listen(configService.get('PORT'));
  console.log(`Swagger is running on: ${await app.getUrl()}/api/swagger`);
}
bootstrap();
