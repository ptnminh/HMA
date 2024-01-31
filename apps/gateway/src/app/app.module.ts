import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { AllExceptionFilter } from 'src/filters/all-exception.filter';
import { AppointmentController } from 'src/modules/appointment/appointment.controller';
import { AuthController } from 'src/modules/auth/auth.controller';
import { JwtStrategy } from 'src/modules/auth/jwt.strategy';
import { ChatsController } from 'src/modules/chats/chats.controller';
import { ClinicsController } from 'src/modules/clinics/clinics.controller';
import { CloudinaryModule } from 'src/modules/files/cloudinary.module';
import { NewsController } from 'src/modules/news/news.controller';
import { NotificationController } from 'src/modules/notification/notification.controller';
import { PaymentController } from 'src/modules/payment/payment.controller';
import { PlansController } from 'src/modules/plans/plans.controller';
import { StaffController } from 'src/modules/staff/staff.controller';
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
    ClientsModule.register([
      {
        name: 'NOTI_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://zwhbnmku:w_XDp3N5qASxWXSmz6O8_sE3flzQMrYf@octopus.rmq3.cloudamqp.com/zwhbnmku',
          ],
          queue: 'notification',
          noAck: true,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [
    AuthController,
    PlansController,
    ClinicsController,
    ChatsController,
    NotificationController,
    PaymentController,
    StaffController,
    AppointmentController,
    NewsController,
  ],
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
    {
      provide: 'CHATS_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          options: {
            host: configService.get('CHAT_SERVICE_HOST'),
            port: configService.get('CHAT_SERVICE_PORT'),
          },
        });
      },

      inject: [ConfigService],
    },

    {
      provide: 'PAYMENT_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          options: {
            host: configService.get('PAYMENT_SERVICE_HOST'),
            port: configService.get('PAYMENT_SERVICE_PORT'),
          },
        });
      },

      inject: [ConfigService],
    },

    {
      provide: 'STAFF_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          options: {
            host: configService.get('STAFF_SERVICE_HOST'),
            port: configService.get('STAFF_SERVICE_PORT'),
          },
        });
      },

      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
