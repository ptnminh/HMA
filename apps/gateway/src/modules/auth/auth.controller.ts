import {
  Controller,
  Post,
  Body,
  Inject,
  HttpException,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { RegisterDto, RegisterResponse } from './dto/create-user.dto';
import { AuthCommand } from './command';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, LoginReponse } from './dto/login.dto';
import { EVENTS } from 'src/shared';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailService: ClientProxy,
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

    await lastValueFrom(
      this.mailService.emit(EVENTS.AUTH_REGISTER, {
        email: createUserResponse.user.email,
        link: createUserResponse.linkComfirm,
      }),
    );
    return {
      message: createUserResponse.message,
      data: {
        user: createUserResponse.user,
        token: createUserResponse.token,
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

  @Get('verify')
  async verifyAccount(@Query('token') token: string) {
    if (!token) {
      throw new HttpException(
        {
          message: 'Lỗi xác thực',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: jwtSercret,
    });
    if (!decoded) {
      throw new HttpException(
        {
          message: 'Lỗi xác thực',
          data: null,
          errors: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate expired token
    const isTokenExpired = Date.now() >= decoded.exp * 1000;
    if (isTokenExpired) {
      throw new HttpException(
        {
          message: 'Đường dẫn đã hết hạn. Vui lòng thử lại sau',
          data: null,
          errors: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const verifyResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_VERIFY, {
        id: decoded.id,
      }),
    );

    if (verifyResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: verifyResponse.message,
          data: null,
          errors: verifyResponse.errors,
        },
        verifyResponse.status,
      );
    }
    const accessToken = await this.jwtService.signAsync(
      {
        ...verifyResponse.user,
      },
      {
        secret: jwtSercret,
      },
    );
    return {
      message: verifyResponse.message,
      data: {
        user: verifyResponse.user,
        token: accessToken,
      },
      success: true,
    };
  }
}
