import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientProxyFactory } from '@nestjs/microservices';
import { AllExceptionFilter } from 'src/filters/all-exception.filter';
import { AuthController } from 'src/modules/auth/auth.controller';
import { JwtStrategy } from 'src/modules/auth/jwt.strategy';
import { CloudinaryController } from 'src/modules/files/cloudinary.controller';
import { CloudinaryModule } from 'src/modules/files/cloudinary.module';
import { PlansController } from 'src/modules/plans/plans.controller';
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
      secret: process.env.SECRET_KEY,
    }),
    CloudinaryModule,
  ],
  controllers: [AuthController, PlansController],
  providers: [
    ConfigService,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
    JwtStrategy,
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
    {
      provide: 'PLAN_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          options: {
            host: configService.get('PLAN_SERVICE_HOST'),
            port: configService.get('PLAN_SERVICE_PORT'),
          },
        });
      },

      inject: [ConfigService],
    },
    {
      provide: 'CLINIC_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          options: {
            host: configService.get('CLINIC_SERVICE_HOST'),
            port: configService.get('CLINIC_SERVICE_PORT'),
          },
        });
      },

      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
