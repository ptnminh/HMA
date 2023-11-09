import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { config } from '../configs';
import { PrismaService } from '../prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { AllExceptionFilter } from 'src/filters/all-exception.filter';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    JwtModule.register({
      signOptions: {
        expiresIn: '5h',
      },
    }),
    ClientsModule.register([
      {
        name: 'MAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://zwhbnmku:w_XDp3N5qASxWXSmz6O8_sE3flzQMrYf@octopus.rmq3.cloudamqp.com/zwhbnmku',
          ],
          queue: 'mail',
          noAck: true,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
    AuthService,
    PrismaService,
  ],
})
export class AuthModule {}
