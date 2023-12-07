import { Module } from '@nestjs/common';
import { ClinicController } from './clinics.controller';
import { ClinicService } from './clinics.service';
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
  controllers: [ClinicController],
  providers: [
    ClinicService,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
    PrismaService,
  ],
})
export class ClinicModule {}
