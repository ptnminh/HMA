import { Module } from '@nestjs/common';
import { AllExceptionFilter } from 'src/filters/all-exception.filter';
import { ConfigModule } from '@nestjs/config';
import { config } from 'src/configs';
import { PrismaService } from 'src/prisma.service';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
  ],
  controllers: [StaffController],
  providers: [
    StaffService,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
    PrismaService,
  ],
})
export class StaffModule {}
