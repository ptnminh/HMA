import {
  Body,
  Controller,
  Delete,
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
  CreateMedicalRecordServiceDto,
  CreateMedicalRecordUsingSuppliesDto,
  CreateMedicalRequestServiceDto,
  CreatePatientReceptionDto,
  UpdateInvoiceDto,
  UpdateMedicalRecordDto,
  UpdateMedicalRecordServiceDto,
  UpdateMedicalRequestServiceDto,
  UpdateMedicalUsingSuppliesDto,
  UpdatePrescriptionToMedicalRecordDto,
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
  @Put('request-service/:code')
  async updateRequestService(
    @Param('code') code: string,
    @Body() body: UpdateMedicalRequestServiceDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.UPDATE_REQUEST_SERVICE,
        {
          code,
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
  @Post(':medicalRecordId/export-invoice')
  async exportInvoice(@Param('medicalRecordId') medicalRecordId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(PatientReceptionCommand.EXPORT_INVOICE, {
        medicalRecordId: +medicalRecordId,
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

  @Put('export-invoice/:invoiceId')
  async updateInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() body: UpdateInvoiceDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(PatientReceptionCommand.UPDATE_INVOICE, {
        invoiceId: +invoiceId,
        ...body,
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

  @Put(':medicalRecordId/prescription')
  async updatePrescriptionToMedicalRecord(
    @Param('medicalRecordId') medicalRecordId: string,
    @Body() body: UpdatePrescriptionToMedicalRecordDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.UPDATE_MEDICAL_RECORD_PRESCRIPTION,
        {
          medicalRecordId: +medicalRecordId,
          precriptions: body.prescriptions,
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
  @Post(':medicalRecordId/services')
  async createServiceToMedicalRecord(
    @Param('medicalRecordId') medicalRecordId: string,
    @Body() body: CreateMedicalRecordServiceDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.CREATE_MEDICAL_RECORD_SERVICE,
        {
          medicalRecordId: +medicalRecordId,
          ...body,
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

  @Delete(':medicalRecordId/services/:serviceId')
  async deleteServiceToMedicalRecord(
    @Param('medicalRecordId') medicalRecordId: string,
    @Param('serviceId') serviceId: string,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.DELETE_MEDICAL_RECORD_SERVICE,
        {
          medicalRecordId: +medicalRecordId,
          clinicServiceId: +serviceId,
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

  @Post(':medicalRecordId/using-supplies')
  async createUsingSuppliesToMedicalRecord(
    @Param('medicalRecordId') medicalRecordId: string,
    @Body() body: CreateMedicalRecordUsingSuppliesDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.CREATE_MEDICAL_RECORD_USING_SUPPLIES,
        {
          medicalRecordId: +medicalRecordId,
          supplies: body.supplies,
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

  @Put(':medicalRecordId/using-supplies/:usingMedicalSupplyId')
  async updateUsingSuppliesToMedicalRecord(
    @Param('medicalRecordId') medicalRecordId: string,
    @Param('usingMedicalSupplyId') usingMedicalSupplyId: string,
    @Body() body: UpdateMedicalUsingSuppliesDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        PatientReceptionCommand.UPDATE_MEDICAL_RECORD_USING_SUPPLIES,
        {
          medicalRecordId: +medicalRecordId,
          usingMedicalSupplyId: +usingMedicalSupplyId,
          ...body,
        },
      ),
    );
    if (clinicServiceResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
          error: clinicServiceResponse.error,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
      error: clinicServiceResponse.error,
    };
  }
}
