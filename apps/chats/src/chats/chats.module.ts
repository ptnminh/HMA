import { Module } from '@nestjs/common';
import { ChatController } from './chats.controller';
import { ChatService } from './chats.service';
import { AllExceptionFilter } from 'src/filters/all-exception.filter';
import { ConfigModule } from '@nestjs/config';
import { config } from 'src/configs';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
    PrismaService,
  ],
})
export class ChatModule {}
