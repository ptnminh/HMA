import {
    Controller,
    Get,
    Delete,
    Post,
    Body,
    Param,
    Put,
    Inject,
    HttpStatus,
    HttpException,
    GatewayTimeoutException,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiQuery,
    ApiTags,
  } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
  import { ClientProxy } from '@nestjs/microservices';
  import { firstValueFrom } from 'rxjs';
import { StaffCommand } from './command';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CreeateScheduleDto } from './dto/create-schedule.dto';
import { ScheduleList, UpdateScheduleDto } from './dto/update-schedule.dto';
import { staffServiceListDto } from './dto/update-staff-service.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
  
  @Controller('staffs')
  @ApiTags('Staff')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  export class StaffController {
    constructor(
      @Inject('STAFF_SERVICE') private readonly staffServiceClient: ClientProxy,
    ) {}

    @Post('/:UserInClinicId')
    async createStaff(@Param('UserInClinicId') UserInClinicId: string, @Body() dto: CreateStaffDto) {
      const {services, ...rest} = dto
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.CREATE_STAFF, {
          memberId: parseInt(UserInClinicId),
          services: (dto.services)? dto.services : [],
          ...rest
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
      };
    }

    @Put('/:id')
    async updateStaff(@Body() dto: UpdateStaffDto, @Param('id') id: string) {
      const {services, ...rest} = dto
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.UPDATE_STAFF, {
          id: parseInt(id),
          services: (dto.services)? dto.services : undefined,
          ...rest
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
      };
    }

    @Delete('/:id')
    async deleteStaff(@Param('id') id: string) {
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.DELETE_STAFF, {
          id: parseInt(id)
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
      };
    }

    @Get('/:id')
    async findStaffById(@Param('id') id: string) {
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.FIND_STAFF_BY_ID, {
          id: parseInt(id)
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
     };
 }


    /*@Post('/:staffId/schedule')
    async createSchedule(@Param('staffId') staffId: string, @Body() dto: CreeateScheduleDto) {
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.CREATE_SCHEDULE, {
          staffId: parseInt(staffId),
          startTime: new Date(dto.startTime.replace(" ", "T") + ":00.000Z"),
          endTime: new Date(dto.endTime.replace(" ", "T") + ":00.000Z")
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
      };
    }


    @Delete('/schedule/:id')
    async deleteSchedule(@Param('id') id: string) {
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.DELETE_SCHEDULE, {
          id: parseInt(id)
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
      };
    }

    @Get('schedule/:id')
    async findScheduleById(@Param('id') id: string) {
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.FIND_SCHEDULE_BY_ID, {
          id: parseInt(id)
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
      };
    }
    */


    @Put(':staffId/schedule/')
    async updateSchdule(@Param('staffId') staffId: string, @Body() scheduleList: ScheduleList) {
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.UPDATE_SCHEDULE, {
          staffId: parseInt(staffId),
          scheduleList: (scheduleList.schedules)? scheduleList.schedules : [],
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
      };
    }

    @Get('/:staffId/schedule')
    async findScheduleByStaffId(@Param('staffId') staffId: string) {
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.FIND_SCHEDULE_BY_STAFF_ID, {
          staffId: parseInt(staffId)
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
      };
    }

    @Get()
    async findAllStaff() {
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.FIND_ALL_STAFF, {
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
      };
    }

    
    @Get(':staffId/services')
    async findServiceByStaffId(@Param('staffId') staffId: string) {
      const staffServiceResponse = await firstValueFrom(
        this.staffServiceClient.send(StaffCommand.FIND_SERVICE_BY_STAFF_ID, {
          staffId: parseInt(staffId),
        })
      );
      if (staffServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: staffServiceResponse.message,
            data: null,
            status: false,
          },
          staffServiceResponse.status,
        );
      }
      return {
        message: staffServiceResponse.message,
        data: staffServiceResponse.data,
        status: true,
      };
    }
    

    // @Put(':staffId/services')
    // async updateStaffService(@Param('staffId') staffId: string, @Body() services :staffServiceListDto) {
    //   const staffServiceResponse = await firstValueFrom(
    //     this.staffServiceClient.send(StaffCommand.UPDATE_STAFF_SERVICE, {
    //       staffId: +staffId,
    //       clinicServiceList: (services.clinicServices) ? services.clinicServices : [],
    //     })
    //   );
    //   if (staffServiceResponse.status !== HttpStatus.OK) {
    //     throw new HttpException(
    //       {
    //         message: staffServiceResponse.message,
    //         data: null,
    //         status: false,
    //       },
    //       staffServiceResponse.status,
    //     );
    //   }
    //   return {
    //     message: staffServiceResponse.message,
    //     data: staffServiceResponse.data,
    //     status: true,
    //   };
    // }
  }