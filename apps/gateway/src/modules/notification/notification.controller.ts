import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateRealtimeNotificationResponse,
  CreateUserTokenResponse,
} from './dto/response';
import {
  CreateRealtimeNotificationDto,
  CreateUserTokenDTO,
  PushNotificationDTO,
} from './dto/noti.dto';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { NotiCommand } from './command';

@Controller('notification')
@ApiTags('Notification')
export class NotificationController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
    @Inject('NOTI_SERVICE')
    private readonly notificationServiceClient: ClientProxy,
  ) {}

  @Post('create-user-token')
  @ApiOkResponse({ type: CreateUserTokenResponse })
  async createUserToken(@Body() body: CreateUserTokenDTO) {
    try {
      const createTokenResponse = await firstValueFrom(
        this.authServiceClient.send(NotiCommand.CREATE_USER_TOKEN, body),
      );
      if (createTokenResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: createTokenResponse.message,
            data: null,
            status: false,
          },
          createTokenResponse.status,
        );
      }
      return {
        message: createTokenResponse.message,
        status: true,
      };
    } catch (error) {
      return error;
    }
  }

  @Delete('delete-user-token')
  @ApiOkResponse({ type: CreateUserTokenResponse })
  async deleteUserToken(@Body() body: CreateUserTokenDTO) {
    try {
      const deleteTokenResponse = await firstValueFrom(
        this.authServiceClient.send(NotiCommand.DELETE_USER_TOKEN, body),
      );
      if (deleteTokenResponse.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: deleteTokenResponse.message,
            data: null,
            status: false,
          },
          deleteTokenResponse.status,
        );
      }
      return {
        message: deleteTokenResponse.message,
        status: true,
      };
    } catch (error) {
      return error;
    }
  }

  @Post('push-notification')
  @ApiOkResponse({ type: CreateRealtimeNotificationResponse })
  async pushNotification(@Body() body: PushNotificationDTO) {
    try {
      const { userId, ...rest } = body;
      const getTokens = await firstValueFrom(
        this.authServiceClient.send(NotiCommand.GET_USER_TOKEN, {
          userId,
        }),
      );
      if (getTokens.status !== HttpStatus.OK) {
        throw new HttpException(
          {
            message: getTokens.message,
            data: null,
            status: false,
          },
          getTokens.status,
        );
      }
      const tokens = getTokens.data?.map((item) => item.token);
      await lastValueFrom(
        this.notificationServiceClient.emit(NotiCommand.PUSH_NOTIFICATION, {
          tokens,
          ...rest,
        }),
      );
      return {
        message: 'Gửi notification thành công',
        status: true,
      };
    } catch (error) {
      return error;
    }
  }

  @Post('create-realtime-notification')
  @ApiOkResponse({ type: CreateRealtimeNotificationResponse })
  async createRealtimeNotification(
    @Body() body: CreateRealtimeNotificationDto,
  ) {
    try {
      await lastValueFrom(
        this.notificationServiceClient.emit(
          NotiCommand.CREATE_REALTIME_NOTIFICATION,
          body,
        ),
      );
      return {
        message: 'Gửi notification thành công',
        status: true,
      };
    } catch (error) {
      return error;
    }
  }
}
