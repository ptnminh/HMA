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
import { CreateUserTokenResponse } from './dto/response';
import { CreateUserTokenDTO } from './dto/noti.dto';
import { firstValueFrom } from 'rxjs';
import { NotiCommand } from './command';

@Controller('notification')
@ApiTags('Notification')
export class NotificationController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
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
}
