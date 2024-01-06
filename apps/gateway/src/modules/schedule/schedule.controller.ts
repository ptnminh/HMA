import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
  Inject,
  HttpStatus,
  HttpException,
  GatewayTimeoutException,
  Query,
  UseGuards,
  Delete,
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
import { ScheduleCommand } from './command';
import { createScheduleDto } from './dto';
import { time } from 'console';

@Controller('schedules')
@ApiTags('Schedules')
/*@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Bearer')*/
export class ScheduleController {
  constructor(
    @Inject('SCHEDULE_SERVICE') private readonly scheduleServiceClient: ClientProxy,
  ) {}

  @Get('/:id')
  async findScheduleById(@Query('id') id: string ) {
    const scheduleServiceResponse = await firstValueFrom(this.scheduleServiceClient.send(ScheduleCommand.FIND_SCHEDULE_BY_ID, {id: parseInt(id)}))
    if (scheduleServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: scheduleServiceResponse.message,
          status: false,
          data: null,
        },
        scheduleServiceResponse.status,
      );
    }
    return {
      message: scheduleServiceResponse.message,
      data: scheduleServiceResponse.data,
      status: true,
    }
  }

  @Get('/find-schedule-by-user/:userId')
  async findScheduleByUserId(@Query('userId') userId: string ) {
    const scheduleServiceResponse = await firstValueFrom(this.scheduleServiceClient.send(ScheduleCommand.FIND_SCHEDULE_BY_USER_ID, {userId}))
    if (scheduleServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: scheduleServiceResponse.message,
          status: false,
          data: null,
        },
        scheduleServiceResponse.status,
      );
    }
    return {
      message: scheduleServiceResponse.message,
      data: scheduleServiceResponse.data,
      status: true,
    }
  }

  @Delete('/:id')
  async deleteSchedule(@Query('id') id: string) {
    const scheduleServiceResponse = await firstValueFrom(this.scheduleServiceClient.send(ScheduleCommand.DELETE_SCHEDULE, {id: parseInt(id)}))
    if (scheduleServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: scheduleServiceResponse.message,
          status: false,
          data: null,
        },
        scheduleServiceResponse.status,
      );
    }
    return {
      message: scheduleServiceResponse.message,
      data: scheduleServiceResponse.data,
      status: true,
    }
  }

  @Post(':userId')
  async createSchedule(@Query('userId') userId: string, @Body() dto: createScheduleDto) {
    const data = {
      userId,
      day: dto.day,
      startTime: dto.startTime,
      endTime: dto.endTime,
    }
    const scheduleServiceResponse = await firstValueFrom(this.scheduleServiceClient.send(ScheduleCommand.CREATE_SCHEDULE, {...data}))
    if (scheduleServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: scheduleServiceResponse.message,
          status: false,
          data: null,
        },
        scheduleServiceResponse.status,
      );
    }
    return {
      message: scheduleServiceResponse.message,
      data: scheduleServiceResponse.data,
      status: true,
    }    
  }

  @Put('/:id')
  async updateSchedule(@Query('id') id: string, @Body() dto: createScheduleDto) {
    const data = {
      id: parseInt(id),
      day: dto.day,
      startTime: dto.startTime,
      endTime: dto.endTime
    }
    const scheduleServiceResponse = await firstValueFrom(this.scheduleServiceClient.send(ScheduleCommand.UPDATE_SCHEDULE, {...data}))
    if (scheduleServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: scheduleServiceResponse.message,
          status: false,
          data: null,
        },
        scheduleServiceResponse.status,
      );
    }
    return {
      message: scheduleServiceResponse.message,
      data: scheduleServiceResponse.data,
      status: true,
    }    
  }

}
