import { Module } from '@nestjs/common';
import { PlanController } from './plans.controller';
import { PlanService } from './plans.service';
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
  controllers: [PlanController],
  providers: [
    PlanService,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
    PrismaService,
  ],
})
export class PlanModule {}
