import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { AuthCommand } from './command';
import { RegisterDto } from './dto/create-user.dto';
import {
  EVENTS,
  PROVIDERS,
  ROLES,
  comparePassword,
  hashPassword,
} from 'src/shared';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { isEmpty } from 'lodash';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject('MAIL_SERVICE') private readonly mailService: ClientProxy,
  ) {}

  @MessagePattern(AuthCommand.USER_CREATE)
  async register(data: RegisterDto) {
    try {
      const { email, ...rest } = data;

      const exUser = await this.authService.findUserByEmail(email);
      if (exUser?.emailVerified) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tài khoản đã tồn tại',
        };
      }
      if (exUser) {
        const encryptedPassword = await hashPassword(rest.password);

        await this.authService.updateUserByEmail(email, {
          ...rest,
          password: encryptedPassword,
        });
      } else {
        await this.authService.signUpByEmail(data);
      }
      const user = await this.authService.findUserByEmail(email);

      const backendUrl = this.configService.get<string>('BACKEND_URL');
      const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
      const registerToken = await this.jwtService.signAsync(
        {
          id: user.id,
        },
        {
          secret: jwtSercret,
          expiresIn: '30d',
        },
      );
      const linkComfirm =
        backendUrl + '/api/auth/verify?token=' + registerToken;

      await lastValueFrom(
        this.mailService.emit(EVENTS.AUTH_REGISTER, {
          email,
          link: linkComfirm,
        }),
      );
      return {
        message: 'Create user successfully',
        status: HttpStatus.CREATED,
        user: {
          ...user,
          role: user.role.name,
          emailVerified: false,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  @MessagePattern(AuthCommand.USER_LOGIN)
  async login(data: { email: string; password: string }) {
    try {
      const { email, password } = data;

      const user = await this.authService.findUserByEmail(email);
      if (!user) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Email does not exist',
        };
      }
      if (!user.emailVerified) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Email is not verified',
        };
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Password is not correct',
        };
      }

      const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
      const token = await this.jwtService.signAsync(
        {
          ...user,
        },
        {
          secret: jwtSercret,
        },
      );
      return {
        status: HttpStatus.OK,
        message: 'Login successfully',
        user: {
          ...user,
          role: user.role.name,
        },
        token,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  @MessagePattern(AuthCommand.USER_VERIFY)
  async verfiyAccount(data: { id: string }) {
    try {
      const { id } = data;
      await this.authService.verifyEmail(id);
      const user = await this.authService.findUserVerifiedById(id);

      return {
        status: HttpStatus.OK,
        message: 'Verify account successfully',
        user: {
          ...user,
          role: user.role.name,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  @MessagePattern(AuthCommand.USER_CONFIRM)
  async confirmAccount(data: { email: string; role: string }) {
    try {
      // create user with email and password is email
      const backendUrl = this.configService.get<string>('BACKEND_URL');
      const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
      const { email, role } = data;
      const roleId = ROLES[role.toUpperCase()];
      const password = email;
      const exUser = await this.authService.findUserByEmail(email);
      if (exUser?.emailVerified) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tài khoản đã tồn tại',
        };
      }
      if (exUser) {
        const encryptedPassword = await hashPassword(password);

        await this.authService.updateUserByEmail(email, {
          roleId,
          password: encryptedPassword,
        });
      } else {
        await this.authService.signUpByEmail({ password, email, roleId });
      }
      const user = await this.authService.findUserByEmail(email);

      const confirmToken = await this.jwtService.signAsync(
        {
          id: user.id,
        },
        {
          secret: jwtSercret,
          expiresIn: '30d',
        },
      );
      const linkComfirm = backendUrl + '/api/auth/verify?token=' + confirmToken;

      await lastValueFrom(
        this.mailService.emit(EVENTS.AUTH_REGISTER, {
          email,
          link: linkComfirm,
        }),
      );
      return {
        status: HttpStatus.OK,
        message: 'Gửi mail thành công',
        link: linkComfirm,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }

  @MessagePattern(AuthCommand.USER_OAUTH_LOGIN)
  async loginWithGoogle(data: any) {
    try {
      const { user: oauthUser } = data;
      let userId: string = '';
      let user: any;
      const exUser = await this.authService.findUserByEmail(oauthUser.email);
      if (exUser) {
        // if this user has no account then create one else do nothing
        const account = await this.authService.findAccountByUserId(
          exUser.id,
          PROVIDERS.GOOGLE,
        );
        if (isEmpty(account)) {
          // link user to provider account
          await this.authService.createAccount({
            userId: exUser.id,
            provider: PROVIDERS.GOOGLE,
            avatar: oauthUser.picture,
          });
        }

        userId = exUser.id;
        user = exUser;
      } else {
        const createdUser = await this.authService.signUpByEmail({
          email: oauthUser.email,
          password: oauthUser.email,
          firstName: oauthUser.firstName,
          lastName: oauthUser.lastName,
          emailVerified: true,
        });
        await this.authService.createAccount({
          userId: createdUser.id,
          provider: 'google',
          avatar: oauthUser.picture,
        });
        userId = createdUser.id;
        user = createdUser;
      }
      const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
      const registerToken = await this.jwtService.signAsync(
        {
          id: userId,
        },
        {
          secret: jwtSercret,
          expiresIn: '30d',
        },
      );
      return {
        message: 'Create user successfully',
        status: HttpStatus.CREATED,
        user: {
          ...user,
          emailVerified: true,
          role: user.role.name,
        },
        token: registerToken,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }
}
