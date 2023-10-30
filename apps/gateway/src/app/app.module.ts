import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientProxyFactory } from '@nestjs/microservices';
import { AllExceptionFilter } from 'src/filters/all-exception.filter';
import { AuthController } from 'src/modules/auth/auth.controller';
import { CloudinaryController } from 'src/modules/files/cloudinary.controller';
import { CloudinaryModule } from 'src/modules/files/cloudinary.module';
import { GoogleStrategy } from 'src/stategies/google.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      signOptions: {
        expiresIn: '5h',
      },
    }),
    CloudinaryModule,
  ],
  controllers: [AuthController],
  providers: [
    ConfigService,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
    GoogleStrategy,
    {
      provide: 'AUTH_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          options: {
            host: configService.get('AUTH_SERVICE_HOST'),
            port: configService.get('AUTH_SERVICE_PORT'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
