import { Module } from '@nestjs/common';
import { AllExceptionFilter } from 'src/filters/all-exception.filter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'src/configs';
import { PrismaService } from 'src/prisma.service';
import { ClientProxyFactory } from '@nestjs/microservices';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
    {
      provide: 'AUTH_SERVICE',
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
    PrismaService,
  ],
})
export class PaymentModule {}
