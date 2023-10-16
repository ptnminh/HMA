import {
  Controller,
  Post,
  Body,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RegisterDto, RegisterResponse } from './dto/create-user.dto';
import { AuthCommand } from './command';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @ApiCreatedResponse({
    type: RegisterResponse,
  })
  async register(@Body() body: RegisterDto) {
    try {
      const createUserResponse = await firstValueFrom(
        this.authServiceClient.send(AuthCommand.USER_CREATE, body),
      );
      if (createUserResponse.status !== HttpStatus.CREATED) {
        throw new HttpException(
          {
            message: createUserResponse.message,
            data: null,
            errors: createUserResponse.errors,
          },
          createUserResponse.status,
        );
      }
      const token = await this.jwtService.signAsync(
        {
          ...createUserResponse.user,
        },
        {
          // expiresIn: '10',
          secret: 'thisisverysecretkey',
        },
      );
      return {
        message: createUserResponse.message,
        data: {
          user: createUserResponse.user,
          token: token,
        },
        success: true,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
