import {
  Controller,
  Post,
  Body,
  Inject,
  HttpException,
  HttpStatus,
  Get,
  Query,
  UseGuards,
  Request,
  Render,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import {
  RegisterDto,
  RegisterResponse,
  AccountDto,
} from './dto/create-user.dto';
import { AuthCommand } from './command';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, LoginReponse } from './dto/login.dto';
import { ConfirmDTO, ConfirmReponse } from './dto/confirm.dto';
import { GoogleOAuthGuard } from 'src/guards/google-oauth.guard';
import {
  DeleteAccountsResponse,
  GetUserAccountsResponse,
  LinkAccountResponse,
} from './dto/link-account.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

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
          status: false,
        },
        createUserResponse.status,
      );
    }
    const { password, ...rest } = createUserResponse.user;

    return {
      message: createUserResponse.message,
      data: {
        user: rest,
        token: createUserResponse.token,
      },
      status: true,
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
          status: false,
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
    const { password, ...rest } = loginResponse.user;

    return {
      message: loginResponse.message,
      data: {
        user: rest,
        token: token,
      },
      status: true,
    };
  }

  @Render('index')
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
          status: false,
        },
        verifyResponse.status,
      );
    }
    return { name: verifyResponse.user.firstName };
  }

  @ApiCreatedResponse({
    type: ConfirmReponse,
  })
  @Post('invite')
  async confirmAccount(@Body() body: ConfirmDTO) {
    const confirmResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_CONFIRM, body),
    );
    if (confirmResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: confirmResponse.message,
          data: null,
          status: false,
        },
        confirmResponse.status,
      );
    }
    return {
      message: confirmResponse.message,
      data: null,
      status: true,
    };
  }

  // @Get()
  // @UseGuards(GoogleOAuthGuard)
  // async googleAuth(@Request() req) {}

  // @Get('google-redirect')
  // @UseGuards(GoogleOAuthGuard)
  // async googleAuthRedirect(@Request() req) {
  //   const { user } = req;
  //   if (!user) {
  //     throw new HttpException(
  //       {
  //         message: 'Lỗi xác thực',
  //         data: null,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const oauthResponse = await firstValueFrom(
  //     this.authServiceClient.send(AuthCommand.USER_OAUTH_LOGIN, {
  //       user,
  //     }),
  //   );
  //   return {
  //     message: oauthResponse.message,
  //     data: {
  //       user: oauthResponse.user,
  //       token: oauthResponse.token,
  //     },
  //     status: true,
  //   };
  // }

  @Post('link-account')
  @ApiCreatedResponse({
    type: LinkAccountResponse,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  async createAccount(@Body() body: AccountDto) {
    const oauthResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_OAUTH_LOGIN, {
        user: body,
      }),
    );
    if (oauthResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: oauthResponse.message,
          data: null,
          status: false,
        },
        oauthResponse.status,
      );
    }
    return {
      message: oauthResponse.message,
      data: oauthResponse.data,
      status: true,
    };
  }

  @Get(':userId/accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiCreatedResponse({
    type: GetUserAccountsResponse,
  })
  async getAllAccounts(@Param('userId') userId: string) {
    const accountsResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_GET_ACCOUNTS, {
        userId,
      }),
    );
    if (accountsResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: accountsResponse.message,
          data: null,
          status: false,
        },
        accountsResponse.status,
      );
    }
    return {
      message: accountsResponse.message,
      data: accountsResponse.data,
      status: true,
    };
  }

  @Delete(':userId/accounts/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiCreatedResponse({
    type: DeleteAccountsResponse,
  })
  async deleteAccounts(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
  ) {
    const accountsResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_DELETE_ACCOUNT, {
        accountId,
        userId,
      }),
    );
    if (accountsResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: accountsResponse.message,
          data: null,
          status: false,
        },
        accountsResponse.status,
      );
    }
    return {
      message: accountsResponse.message,
      data: accountsResponse.data,
      status: true,
    };
  }
  @Get('all-users')
  async getAllUsers()
  {
    const Response = await firstValueFrom (
      this.authServiceClient.send(AuthCommand.GET_ALL_USERS, {})
    );
    if (Response.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: Response.message,
          data: null,
          status: false,
        },
        Response.status,
      )
    }
    return {
      message: Response.message,
      data: Response.data,
      status: true,
    }
  }

  @Get('all-permissions')
  async getAllPermissions()
  {
    const Response = await firstValueFrom (
      this.authServiceClient.send(AuthCommand.GET_ALL_PERMISSIONS, {})
    );
    if (Response.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: Response.message,
          data: null,
          status: false,
        },
        Response.status,
      )
    }
    return {
      message: Response.message,
      data: Response.data,
      status: true,
    }
  }
}
