import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateMedicalRequestServiceDto,
  CreatePatientReceptionDto,
  UpdateMedicalRecordDto,
  UpdateMedicalRecordServiceDto,
} from './dto/body.dto';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { PatientReceptionCommand } from './command';
import { QueryGetListMedicalRecordDto } from './dto/query.dto';

@Controller('medical-records')
@ApiTags('Medical Records')
export class PatientReceptionsController {
  constructor(
    @Inject('CLINIC_SERVICE')
    private readonly clinicServiceClient: ClientProxy,
  ) {}

  @Get('request-service/:code')
  async requestServiceByCode(@Param('code') code: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.GET_REQUEST_SERVICE_BY_CODE,
        {
          code,
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

  @Post(':medicalRecordId/request-service')
  async requestService(
    @Query('medicalRecordId') medicalRecordId: string,
    @Body() body: CreateMedicalRequestServiceDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(PatientReceptionCommand.REQUEST_SERVICE, {
        medicalRecordId: +medicalRecordId,
        ...body,
      }),
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
  @Post()
  async createPatientReception(
    @Body() createPatientReceptionDto: CreatePatientReceptionDto,
  ): Promise<any> {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.CREATE_PATIENT_RECEPTION,
        {
          ...createPatientReceptionDto,
        },
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

  @Put(':medicalRecordId')
  async updatePatientReception(
    @Body() createPatientReceptionDto: UpdateMedicalRecordDto,
    @Param('medicalRecordId') medicalRecordId: string,
  ): Promise<any> {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.UPDATE_PATIENT_RECEPTION,
        {
          id: +medicalRecordId,
          ...createPatientReceptionDto,
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

  @Get(':medicalRecordId')
  async getMedicalRecord(@Param('medicalRecordId') medicalRecordId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.GET_MEDICAL_RECORD,
        {
          id: +medicalRecordId,
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

  @Get()
  async getMedicalRecords(@Query() query: QueryGetListMedicalRecordDto) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.GET_LIST_MEDICAL_RECORD,
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

  @Put(':medicalRecordId/services/:serviceId')
  async updateServiceToMedicalRecord(
    @Param('medicalRecordId') medicalRecordId: string,
    @Param('serviceId') serviceId: string,
    @Body() body: UpdateMedicalRecordServiceDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.UPDATE_MEDICAL_RECORD_SERVICE,
        {
          medicalRecordId: +medicalRecordId,
          clinicServiceId: +serviceId,
          ...body,
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