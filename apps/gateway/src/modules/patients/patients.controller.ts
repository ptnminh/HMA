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
  ApiQuery,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PatientCommand } from './command';
import { CreatePatientDto } from './dto/body.dto';
import { updatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
@ApiTags('Patients')
export class PatientsController {
  constructor(
    @Inject('CLINIC_SERVICE')
    private readonly clinicServiceClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Post()
  async createPatient(@Body() body: CreatePatientDto) {
    if (!body.userId && Object.keys(body.userInfo).length === 0) {
      throw new HttpException(
        {
          message: 'userId || userInfo không được để trống',
          data: null,
          status: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(PatientCommand.CREATE_PATIENT, body),
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

  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'clinicId', required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'phone', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'isDisabled', required: false })
  @ApiQuery({ name: 'emailVerified', required: false })
  @Get()
  async searchPatients(
    @Query('userId') userId: string,
    @Query('clinicId') clinicId: string,
    @Query('gender') gender?: number,
    @Query('phone') phone?: string,
    @Query('email') email?: string,
    @Query('name') name?: string,
    @Query('isDisabled') isDisabled?: boolean,
    @Query('emailVerified') emailVerified?: boolean
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(PatientCommand.SEARCH_PATIENT, {
        userId,
        clinicId,
        phone,
        email,
        name,
        gender: +gender,
        isDisabled,
        emailVerified,
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

  @Get('/:id')
  async findPatientById(@Param('id') id: number) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(PatientCommand.GET_PATIENT_BY_ID, {
        id: +id
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


  @Delete('/:id')
  async deletePatient(@Param('id') id: number) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(PatientCommand.DELETE_PATIENT, {
        id: +id
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

  @Put('/:id')
  async updatePatient(@Param('id') id: number, @Body() dto: updatePatientDto) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(PatientCommand.UPDATE_PATIENT, {
        id: +id,
        payload: {...dto}
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
}
