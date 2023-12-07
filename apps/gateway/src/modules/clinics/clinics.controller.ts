import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CreateClinicDto, CreateClinicResponse } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ClinicCommand } from './command';

@Controller('clinics')
@ApiTags('Clinics')
export class ClinicsController {
  constructor(
    @Inject('CLINIC_SERVICE')
    private readonly clinicServiceClient: ClientProxy,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: CreateClinicResponse })
  async create(@Body() createClinicDto: CreateClinicDto) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        ClinicCommand.CLINIC_CREATE,
        createClinicDto,
      ),
    );
    if (clinicServiceResponse.status !== HttpStatus.CREATED) {
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
