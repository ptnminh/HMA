import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AppService } from './app.service';
import {
  GetResponse,
  INotificationPayload,
  NotificationPayloadDTO,
  NotificationType,
} from './types';
import { CurrentUser, Public } from './decorators';
import { Notification } from './app.schema';
import { CreateRealtimeNotificationDto } from './dtos/get-notification.dto';
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

  @Post('create-realtime-notification')
  public createRealtimeNotifications(
    @Body() body: CreateRealtimeNotificationDto,
  ): Promise<any> {
    return this.appService.createRealtimeNotifications(body);
  }

  @EventPattern('push_notification')
  public async sendNotification(
    @Payload() payload: any,
    @Ctx() context: RmqContext,
  ): Promise<any> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
    await this.appService.createNotification(payload);
  }

  @Post('push-notification')
  public async sendApiNotification(
    @Body() payload: NotificationPayloadDTO,
  ): Promise<any> {
    await this.appService.createNotification(payload);
  }

  @EventPattern('create_realtime_notification')
  public createRealtimeNotificationsEvent(
    @Payload() params: CreateRealtimeNotificationDto,
    @Ctx() context: RmqContext,
  ): Promise<any> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
    return this.appService.createRealtimeNotifications(params);
  }
}
