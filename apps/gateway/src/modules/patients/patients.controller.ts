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
    UseGuards,
  } from '@nestjs/common';
  import { ClientProxy } from '@nestjs/microservices';
  import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiTags,
    ApiQuery
  } from '@nestjs/swagger';
  import { firstValueFrom } from 'rxjs';
  import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PatientCommand } from './command';
  
  @Controller('patients')
  @ApiTags('Patients')
  export class PatientsController {
    constructor(
      @Inject('CLINIC_SERVICE')
      private readonly clinicServiceClient: ClientProxy,
    ) {}

    
    @ApiQuery({name: "userId", required: false})
    @ApiQuery({name: "clinicId", required: false})
    @ApiQuery({name: "gender", required: false})
    @ApiQuery({name: "phone", required: false})
    @ApiQuery({name: "email", required: false})
    @ApiQuery({name: "name", required: false})
    @Get()
    async searchPatients(
        @Query('userId') userId: string,
        @Query('clinicId') clinicId: string,
        @Query('gender') gender?: number,
        @Query('phone') phone?: string,
        @Query('email') email?:string,
        @Query('name') name?:string,
      ) {
        const clinicServiceResponse = await firstValueFrom(
          this.clinicServiceClient.send(
            PatientCommand.SEARCH_PATIENT,
            {
                userId,
                clinicId,
                phone,
                email,
                name,
                gender: +gender
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