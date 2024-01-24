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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { StaffCommand } from './command';
import { ScheduleList } from './dto/update-schedule.dto';
import { CreateAppoimentDto, CreateStaffDto } from './dto/create-staff.dto';
import { CurrentUser } from 'src/decorators';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { FindFreeAppointmentByStaffIdQueryDto } from './dto/query.dto';

@Controller('staffs')
@ApiTags('Staff')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Bearer')
export class StaffController {
  constructor(
    @Inject('STAFF_SERVICE') private readonly staffServiceClient: ClientProxy,
  ) {}

  @Post(':memberId')
  async createStaff(
    @Param('memberId') UserInClinicId: string,
    @Body() dto: CreateStaffDto,
  ) {
    const { services, ...rest } = dto;
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(StaffCommand.CREATE_STAFF, {
        memberId: parseInt(UserInClinicId),
        services: dto.services ? dto.services : [],
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

  @Get(':memberId')
  async findStaffById(@Param('memberId') memberId: string) {
    const staffServiceResponse = await firstValueFrom(
      this.staffServiceClient.send(StaffCommand.FIND_STAFF_BY_ID, {
        id: parseInt(memberId),
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
}
