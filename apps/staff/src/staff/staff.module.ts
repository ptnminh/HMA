import { Module } from '@nestjs/common';
import { AllExceptionFilter } from 'src/filters/all-exception.filter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'src/configs';
import { PrismaService } from 'src/prisma.service';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
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
  controllers: [StaffController],
  providers: [
    StaffService,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
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
    PrismaService,
  ],
})
export class StaffModule {}
