import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { GetResponse, NotificationType } from './types';
import { CurrentUser, Public } from './decorators';
import { Notification } from './app.schema';
import { GetNotificationDto } from './dtos/get-notification.dto';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private healthCheckService: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
  ) {}

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.mongooseHealth.pingCheck('mongoDB'),
    ]);
  }

  @Get()
  public getNotifications(
    @Query() params: GetNotificationDto,
    @CurrentUser() userId: number,
  ): Promise<GetResponse<Notification>> {
    return this.appService.getNotifications(params, userId);
  }

  @EventPattern('send_notification')
  public async sendNotification(@Payload() payload: string): Promise<any> {
    const data = JSON.parse(payload);
    await this.appService.createNotification(data);
  }

  @Post('send-notification')
  public async sendNotificationToUser(
    @Query('userId') userId: string,
    @Body() body: any,
  ): Promise<any> {
    try {
      const payload = {
        content: 'WELCOME_NOTIFICATION',
        type: NotificationType.WELCOME_NOTIFICATION + 'test',
        payload: 'WELCOME_NOTIFICATION',
        userId,
      };
      await this.appService.createNotification(payload);
    } catch (error) {
      console.log(error);
    }
  }
}
