import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ClinicStatiticsCommand } from './command';
import { GetClinicsByDateQueryDto, GetClinicsQueryDto } from './dto';

@Controller('statitics')
@ApiTags('Clinic Statitics')
export class ClinicStatiticsController {
  constructor(
    @Inject('CLINIC_SERVICE')
    private readonly clinicServiceClient: ClientProxy,
  ) {}

  @Get()
  async getStatitics(@Query() query: GetClinicsQueryDto): Promise<any> {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        ClinicStatiticsCommand.GET_CLINIC_STATITICS,
        {
          ...query,
          ...(query.days && { days: parseInt(query.days) }),
        },
      ),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Get('by-date')
  async getStatiticsByDate(
    @Query() query: GetClinicsByDateQueryDto,
  ): Promise<any> {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        ClinicStatiticsCommand.GET_CLINIC_STATITICS_BY_DATE,
        {
          ...query,
        },
      ),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }
}
