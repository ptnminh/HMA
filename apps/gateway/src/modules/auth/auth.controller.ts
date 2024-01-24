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
  Render,
  Param,
  Delete,
  Patch,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import {
  RegisterDto,
  RegisterResponse,
  AccountDto,
  LinkAccountWithEmail,
} from './dto/create-user.dto';
import { AuthCommand } from './command';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, LoginReponse } from './dto/login.dto';
import { ConfirmDTO, ConfirmReponse } from './dto/confirm.dto';
import { GoogleOAuthGuard } from 'src/guards/google-oauth.guard';
import {
  DeleteAccountsResponse,
  GetAccountsResponse,
  GetUserAccountsResponse,
  LinkAccountResponse,
  LinkAccountWithEmailResponse,
  VerifyUserReponse,
} from './dto/link-account.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import {
  ChangePasswordDto,
  ChangePasswordReponse,
  ResetPasswordVerifyDto,
  ResetPasswordVerifyResponse,
  addNewPasswordDto,
} from './dto/reset-password.dto';
import { Request } from 'express';
import { FindUserByEmailResponse } from './dto/common.dto';
import { IsMobile } from 'src/decorators/device.decorator';
import { Response } from 'express';
import { ClinicCommand } from '../clinics/command';
import { ScheduleDto } from './dto/schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    @Inject('CLINIC_SERVICE')
    private readonly clinicServiceClient: ClientProxy,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiCreatedResponse({
    type: RegisterResponse,
  })
  async register(@Body() body: RegisterDto, @IsMobile() isMobile: boolean) {
    const createUserResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_CREATE, {
        ...body,
        isMobile,
      }),
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

  @Get('verify')
  async verifyAccount(
    @Query('token') token: string,
    @Res() res,
    @IsMobile() isMobile: boolean,
  ) {
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
    const frontEndUrl = this.configService.get<string>('FRONTEND_URL');
    return decoded.isMobile
      ? res.redirect(
          'https://clinus.page.link?link=https%3A%2F%2Fclinus.page.link%2Fverify-account',
        )
      : res.redirect(`${frontEndUrl}/dang-nhap`);
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

  @Get('verify-account')
  async verifyInvitationAccount(
    @Query('token') token: string,
    @IsMobile() isMobile: boolean,
  ) {
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
    let exUserId = decoded.id;
    const {
      clinicId,
      roleId,
      email,
      firstName,
      lastName,
      id: userId,
    } = decoded;
    if (!userId) {
      const verifyResponse = await firstValueFrom(
        this.authServiceClient.send(AuthCommand.USER_CREATE, {
          password: email,
          firstName,
          lastName,
          isInputPassword: false,
          emailVerified: true,
          email,
          noActionSendEmail: true,
        }),
      );

      if (verifyResponse.status !== HttpStatus.CREATED) {
        throw new HttpException(
          {
            message: verifyResponse.message,
            data: null,
            status: false,
          },
          verifyResponse.status,
        );
      }
      exUserId = verifyResponse.user.id;
    }

    const updateResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.ADD_USER_TO_CLINIC, {
        userId: exUserId,
        clinicId,
        roleId: +roleId,
      }),
    );
    if (updateResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateResponse.message,
          data: null,
          status: false,
        },
        updateResponse.status,
      );
    }
    return {
      message: updateResponse.message,
      data: updateResponse.data,
      status: true,
    };
  }

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

  @Get('account')
  @ApiOkResponse({
    type: GetAccountsResponse,
  })
  @ApiQuery({
    name: 'key',
    example: '123456789',
  })
  @ApiQuery({
    name: 'provider',
    example: 'google',
  })
  async findAccount(@Query() query: { key: string; provider: string }) {
    const { key, provider } = query;
    const accountResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_FIND_ACCOUNT, {
        key,
        provider,
      }),
    );
    if (accountResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: accountResponse.message,
          data: null,
          status: false,
        },
        accountResponse.status,
      );
    }
    return {
      message: accountResponse.message,
      data: accountResponse.data,
      status: true,
    };
  }
  @ApiQuery({
    name: 'key',
    example: '123456789',
  })
  @ApiQuery({
    name: 'provider',
    example: 'google',
  })
  @ApiQuery({
    name: 'email',
    example: 'email@gmail.com',
  })
  @ApiOkResponse({
    type: VerifyUserReponse,
  })
  @Get('user/send-email-verify-user')
  async verifyUser(
    @Query() query: { email: string; provider: string; key: string },
  ) {
    const verifyResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_CHECK_VERIFY, query),
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
    return {
      message: verifyResponse.message,
      data: verifyResponse.data,
      status: true,
    };
  }

  @Post('link-account-email')
  @ApiCreatedResponse({
    type: LinkAccountWithEmailResponse,
  })
  async linkAccountEmail(@Body() body: LinkAccountWithEmail) {
    const oauthResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.LINK_ACCOUNT_WITH_EMAIL, body),
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

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @ApiCreatedResponse({
    type: ChangePasswordReponse,
  })
  async ChangePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
    const user = req.user;
    const _dto = {
      id: user['id'],
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
      isReset: dto.isReset,
    };
    const ChangePasswordReponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.CHANGE_PASSWORD, _dto),
    );
    if (ChangePasswordReponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: ChangePasswordReponse.message,
          data: null,
          status: false,
        },
        ChangePasswordReponse.status,
      );
    }
    return {
      message: ChangePasswordReponse.message,
      data: ChangePasswordReponse.data,
      status: true,
    };
  }

  @ApiCreatedResponse({
    type: ResetPasswordVerifyResponse,
  })
  @Post('reset-password')
  async ResetPasswordVerify(@Body() dto: ResetPasswordVerifyDto) {
    const email = dto.email;
    const ResetPasswordVerifyResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.RESET_PASSWORD_VERIFY, dto),
    );
    if (ResetPasswordVerifyResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: ResetPasswordVerifyResponse.message,
          data: ResetPasswordVerifyResponse.data,
          status: false,
        },
        ResetPasswordVerifyResponse.status,
      );
    }
    return {
      message: ResetPasswordVerifyResponse.message,
      data: ResetPasswordVerifyResponse.data,
      status: true,
    };
  }

  @ApiCreatedResponse({
    type: ChangePasswordReponse,
  })
  @Put('add-new-password')
  async addNewPassword(@Body() dto: addNewPasswordDto) {
    const ChangePasswordReponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.ADD_NEW_PASSWORD, dto),
    );
    if (ChangePasswordReponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: ChangePasswordReponse.message,
          data: null,
          status: false,
        },
        ChangePasswordReponse.status,
      );
    }
    return {
      message: ChangePasswordReponse.message,
      data: ChangePasswordReponse.data,
      status: true,
    };
  }

  @ApiOkResponse({
    type: FindUserByEmailResponse,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Get('find-user-by-email')
  async findUserByEmail(@Query('email') email: string) {
    const findUserByEmailResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.FIND_USER_BY_EMAIL, { email }),
    );
    if (findUserByEmailResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: findUserByEmailResponse.message,
          data: null,
          status: false,
        },
        findUserByEmailResponse.status,
      );
    }
    return {
      message: findUserByEmailResponse.message,
      data: findUserByEmailResponse.data,
      status: true,
    };
  }

  @ApiOkResponse({
    type: FindUserByEmailResponse,
  })
  @Post('resend-verify-email')
  async findAllUserByEmail(@Query('email') email: string) {
    const findUserByEmailResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.FIND_ALL_USER_BY_EMAIL, {
        email,
      }),
    );
    if (findUserByEmailResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: findUserByEmailResponse.message,
          data: null,
          status: false,
        },
        findUserByEmailResponse.status,
      );
    }
    return {
      message: findUserByEmailResponse.message,
      data: findUserByEmailResponse.data,
      status: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Get('/schedule/:id')
  async findScheduleById(@Query('id') id: string) {
    const scheduleServiceResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.FIND_SCHEDULE_BY_ID, {
        id: parseInt(id),
      }),
    );
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
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Get('schedule//find-schedule-by-user/:userId')
  async findScheduleByUserId(@Query('userId') userId: string) {
    const scheduleServiceResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.FIND_SCHEDULE_BY_USER_ID, {
        userId,
      }),
    );
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
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Delete('/schedule/:id')
  async deleteSchedule(@Query('id') id: string) {
    const scheduleServiceResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.DELETE_SCHEDULE, {
        id: parseInt(id),
      }),
    );
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
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Post('schedule/:userId')
  async createSchedule(
    @Query('userId') userId: string,
    @Body() dto: ScheduleDto,
  ) {
    const data = {
      userId,
      day: dto.day,
      startTime: dto.startTime,
      endTime: dto.endTime,
    };
    const scheduleServiceResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.CREATE_SCHEDULE, { ...data }),
    );
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
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Put('/schedule/:id')
  async updateSchedule(
    @Query('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    const data = {
      id: parseInt(id),
      ...dto,
    };
    const authServiceResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.UPDATE_SCHEDULE, { ...data }),
    );
    if (authServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: authServiceResponse.message,
          status: false,
          data: null,
        },
        authServiceResponse.status,
      );
    }
    return {
      message: authServiceResponse.message,
      data: authServiceResponse.data,
      status: true,
    };
  }
}
