import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetAppointmentsQueryDto } from '../clinics/dto/create-clinic.dto';
import { firstValueFrom } from 'rxjs';
import { ClinicCommand } from '../clinics/command';
import { CreateAppoimentDto } from '../staff/dto/create-staff.dto';

@Controller('appointments')
@ApiTags('Appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Bearer')
export class AppointmentController {
  constructor(
    @Inject('CLINIC_SERVICE')
    private readonly clinicServiceClient: ClientProxy,
  ) {}
  @Get()
  async getAppointments(@Query() query: GetAppointmentsQueryDto) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.GET_APPOINMENTS, {
        ...query,
      }),
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

  @Post()
  async createAppointment(@Body() data: CreateAppoimentDto) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.CREATE_APPOINMENT, {
        ...data,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Get(':appointmentId')
  async getAppointmentById(@Param('appointmentId') appointmentId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.GET_APPOINMENT_BY_ID, {
        appointmentId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }
}
