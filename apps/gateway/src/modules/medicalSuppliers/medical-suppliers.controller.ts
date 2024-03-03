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
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { MedicalSupplierCommand } from './command';
import {
  CreateMedicalSupplierDto,
  CreateMedicalSupplierResponse,
  UpdateMedicalSupplierDto,
} from './dto/body.dto';
import { GetListQueryDto } from './dto/query.dto';

@Controller('medical-supplies')
@ApiTags('Medical Supplies')
export class MedicalSuppliersController {
  constructor(
    @Inject('CLINIC_SERVICE')
    private readonly clinicServiceClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Post()
  @ApiCreatedResponse({ type: CreateMedicalSupplierResponse })
  async createMedicalSupplier(
    @Body() createMedicalSupplierDto: CreateMedicalSupplierDto,
  ): Promise<CreateMedicalSupplierResponse> {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        MedicalSupplierCommand.MEDICAL_SUPPLIER_CREATE,
        {
          ...createMedicalSupplierDto,
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

  @Get()
  @ApiOkResponse({ type: [CreateMedicalSupplierResponse] })
  async listMedicalSupplier(@Query() query?: GetListQueryDto): Promise<any> {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        MedicalSupplierCommand.MEDICAL_SUPPLIER_LIST,
        query,
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Put(':medicalSupplyId')
  @ApiOkResponse({ type: CreateMedicalSupplierResponse })
  async updateMedicalSupplier(
    @Body() createMedicalSupplierDto: UpdateMedicalSupplierDto,
    @Param('medicalSupplyId') medicalSupplierId: number,
  ): Promise<CreateMedicalSupplierResponse> {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        MedicalSupplierCommand.MEDICAL_SUPPLIER_UPDATE,
        {
          ...createMedicalSupplierDto,
          id: medicalSupplierId,
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

  @Get(':medicalSupplyId')
  @ApiOkResponse({ type: CreateMedicalSupplierResponse })
  async getMedicalSupplierById(
    @Param('medicalSupplyId') medicalSupplierId: number,
  ): Promise<CreateMedicalSupplierResponse> {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        MedicalSupplierCommand.MEDICAL_SUPPLIER_GET,
        {
          id: +medicalSupplierId,
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

  @Delete(':medicalSupplyId')
  async deleteMedicalSupplier(
    @Param('medicalSupplyId') medicalSupplierId: number,
  ): Promise<any> {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        MedicalSupplierCommand.MEDICAL_SUPPLIER_DELETE,
        {
          id: +medicalSupplierId,
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
