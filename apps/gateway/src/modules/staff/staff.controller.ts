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
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { StaffCommand } from './command';
import { ScheduleList } from './dto/update-schedule.dto';
import { CreateAppoimentDto, CreateStaffDto } from './dto/create-staff.dto';
import { CurrentUser } from 'src/decorators';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { FindFreeAppointmentByStaffIdQueryDto } from './dto/query.dto';
import { isNumber } from 'class-validator';

@Controller('staffs')
@ApiTags('Staff')
export class StaffController {
  constructor(
    @Inject('STAFF_SERVICE') private readonly staffServiceClient: ClientProxy,
  ) {}

  @Post()
  async createStaff(@Body() dto: CreateStaffDto) {
    const { services, userId, roleId, clinicId, userInfo, ...rest } = dto;
    if (!userId && Object.keys(userInfo).length === 0) {
      throw new HttpException(
        {
          message: 'userId hoặc userInfo không được để trống',
          data: null,
          status: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(StaffCommand.CREATE_STAFF, {
        clinicId,
        userId,
        roleId: +roleId,
        services: dto.services ? dto.services : [],
        userInfo,
        ...rest,
      }),
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

  @Put(':staffId')
  async updateStaff(@Body() dto: UpdateStaffDto, @Param('staffId') id: string) {
    const { services, ...rest } = dto;
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(StaffCommand.UPDATE_STAFF, {
        id: parseInt(id),
        services: dto.services ? dto.services : undefined,
        ...rest,
      }),
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

  @Delete(':staffId')
  async deleteStaff(@Param('staffId') id: string) {
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(StaffCommand.DELETE_STAFF, {
        id: parseInt(id),
      }),
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

  @Get(':staffId')
  async findStaffById(@Param('staffId') staffId: string) {
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(StaffCommand.FIND_STAFF_BY_ID, {
        id: +staffId,
      }),
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

  @Put(':staffId/schedule')
  async updateSchdule(
    @Param('staffId') staffId: string,
    @Body() scheduleList: ScheduleList,
  ) {
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(StaffCommand.UPDATE_SCHEDULE, {
        staffId: parseInt(staffId),
        scheduleList: scheduleList.schedules ? scheduleList.schedules : [],
      }),
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

  @Get(':staffId/schedule')
  async findScheduleByStaffId(@Param('staffId') staffId: string) {
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(StaffCommand.FIND_SCHEDULE_BY_STAFF_ID, {
        staffId: parseInt(staffId),
      }),
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
      }),
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

  @Get(':staffId/appointments')
  async findAppointmentByStaffId(@Param('staffId') staffId: string) {
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(StaffCommand.FIND_APPOINTMENT_BY_STAFF_ID, {
        staffId: parseInt(staffId),
      }),
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

  @Get(':staffId/free-appointments')
  async findFreeAppointmentByStaffId(
    @Param('staffId') staffId: string,
    @Query() query: FindFreeAppointmentByStaffIdQueryDto,
  ) {
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(
        StaffCommand.FIND_FREE_APPOINTMENT_BY_STAFF_ID,
        {
          staffId: parseInt(staffId),
          date: query.date ? query.date : new Date().toISOString(),
        },
      ),
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

  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'roleId', required: false })
  @ApiQuery({ name: 'clinicId', required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'phoneNumber', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'isDisabled', required: false })
  @ApiQuery({ name: 'isAcceptInvite', required: false })
  @Get()
  async searchStaff(
    @Query('userId') userId: string,
    @Query('roleId') roleId: number,
    @Query('clinicId') clinicId: string,
    @Query('gender') gender?: number,
    @Query('phoneNumber') phoneNumber?: string,
    @Query('email') email?: string,
    @Query('name') name?: string,
    @Query('isDisabled') isDisabled?: boolean,
    @Query('isAcceptInvite') isAcceptInvite?: boolean,
  ) {
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(StaffCommand.SEARCH_STAFF, {
        userId,
        roleId: +roleId,
        gender: +gender,
        clinicId,
        phoneNumber,
        email,
        name,
        isDisabled,
        isAcceptInvite
      }),
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
}
