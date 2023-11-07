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
        message: 'Tạo tài khoản thành công',
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
        message: 'Lỗi hệ thống',
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
        message: 'Đăng nhập thành công',
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
        message: 'Lỗi hệ thống',
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
        message: 'Xác thực email thành công',
        user: {
          ...user,
          role: user.role.name,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
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
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.USER_OAUTH_LOGIN)
  async loginWithGoogle(data: any) {
    try {
      const { user: oauthUser } = data;
      const exAccount = await this.authService.findAccountByProvider(
        oauthUser.key,
        oauthUser.provider,
      );
      if (exAccount) {
        // if this user has no account then create one else do nothing
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tài khoản đã tồn tại',
        };
      } else {
        await this.authService.createAccount({
          provider: oauthUser.provider || PROVIDERS.GOOGLE,
          key: oauthUser.key,
          userId: oauthUser.userId,
          avatar: oauthUser.picture,
        });
      }
      const accounts = await this.authService.getAllAccounts(oauthUser.userId);
      return {
        status: HttpStatus.OK,
        data: accounts,
        message: 'Tạo liên kết thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.USER_GET_ACCOUNTS)
  async getUserAccounts(data: { userId: string }) {
    try {
      const { userId } = data;
      const accounts = await this.authService.getAllAccounts(userId);
      return {
        status: HttpStatus.OK,
        data: accounts,
        message: 'Lấy danh sách tài khoản thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.USER_DELETE_ACCOUNT)
  async deleteUserAccount(data: { accountId: string; userId: string }) {
    try {
      const { accountId } = data;
      await this.authService.deleteAccount(accountId);
      const accounts = await this.authService.getAllAccounts(data.userId);
      return {
        status: HttpStatus.OK,
        data: accounts,
        message: 'Xóa tài khoản thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }
}
