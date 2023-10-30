import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SendgridService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AllExceptionFilter } from './filters/all-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    SendgridService,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
