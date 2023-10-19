import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { AuthController } from 'src/modules/auth/auth.controller';

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
  providers: [
    ConfigService,

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
