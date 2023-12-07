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
  UseGuards,
  Put,
} from '@nestjs/common';
import {
  CreateClinicDto,
  CreateClinicResponse,
  ListClinicResponse,
  SubcribePlanDTO,
  SubcribePlanResponse,
} from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ClinicCommand } from './command';
import { CurrentUser } from 'src/decorators';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('clinics')
@ApiTags('Clinics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Bearer')
export class ClinicsController {
  constructor(
    @Inject('CLINIC_SERVICE')
    private readonly clinicServiceClient: ClientProxy,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: CreateClinicResponse })
  async create(
    @Body() createClinicDto: CreateClinicDto,
    @CurrentUser('id') ownerId: string,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.CLINIC_CREATE, {
        ...createClinicDto,
        ownerId,
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

  @Get()
  @ApiOkResponse({ type: ListClinicResponse })
  async findAll(@CurrentUser('id') ownerId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.CLINIC_LIST, {
        ownerId,
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
  @Put(':id')
  @ApiOkResponse({ type: CreateClinicResponse })
  async update(
    @Param('id') id: string,
    @Body() updateClinicDto: UpdateClinicDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.UPDATE_CLINIC, {
        ...updateClinicDto,
        id,
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

  @Post(':id/add-user-to-clinic/:userId')
  @ApiOkResponse({ type: CreateClinicResponse })
  async addUserToClinic(
    @Param('id') clinicId: string,
    @Param('userId') userId: string,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.ADD_USER_TO_CLINIC, {
        clinicId,
        userId,
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

  @Post(':clinicId/subscribe-plan/:planId')
  @ApiOkResponse({ type: SubcribePlanResponse })
  async subscribePlan(@Body() data: SubcribePlanDTO) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.SUBSCRIBE_PLAN, data),
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
