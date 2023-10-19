import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { config } from '../configs';
import { PrismaService } from '../prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ClientsModule.register([
      {
        name: 'MAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:password@localhost:5672'],
          queue: 'mail',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
