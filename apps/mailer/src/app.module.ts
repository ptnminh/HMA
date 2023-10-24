import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SendgridService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [SendgridService],
})
export class AppModule {}
