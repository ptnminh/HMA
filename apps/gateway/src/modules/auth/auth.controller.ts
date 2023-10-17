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
import { ConfigService } from '@nestjs/config';
import { LoginDto, LoginReponse } from './dto/login.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiCreatedResponse({
    type: RegisterResponse,
  })
  async register(@Body() body: RegisterDto) {
    const createUserResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_CREATE, body),
    );
    if (createUserResponse.status !== HttpStatus.CREATED) {
      console.log(createUserResponse);
      throw new HttpException(
        {
          message: createUserResponse.message,
          data: null,
          errors: createUserResponse.errors,
        },
        createUserResponse.status,
      );
    }
    const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
    const token = await this.jwtService.signAsync(
      {
        ...createUserResponse.user,
      },
      {
        secret: jwtSercret,
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
  }

  @Post('login')
  @ApiCreatedResponse({
    type: LoginReponse,
  })
  async login(@Body() body: LoginDto) {
    const loginResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_LOGIN, body),
    );
    if (loginResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: loginResponse.message,
          data: null,
          errors: loginResponse.errors,
        },
        loginResponse.status,
      );
    }
    const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
    const token = await this.jwtService.signAsync(
      {
        ...loginResponse.user,
      },
      {
        secret: jwtSercret,
      },
    );
    return {
      message: loginResponse.message,
      data: {
        user: loginResponse.user,
        token: token,
      },
      success: true,
    };
  }
}
