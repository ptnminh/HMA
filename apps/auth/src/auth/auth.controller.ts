import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { AuthCommand } from './command';
import { RegisterDto } from './dto/create-user.dto';
import {
  EVENTS,
  MODULES,
  PROVIDERS,
  comparePassword,
  hashPassword,
} from 'src/shared';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { Prisma } from '@prisma/client';

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
      const { email, isMobile, noActionSendEmail, ...rest } = data;

      const exUser = await this.authService.findUserByEmail(email);
      if (exUser?.emailVerified) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tài khoản đã tồn tại',
        };
      }
      if (exUser) {
        const encryptedPassword = await hashPassword(rest.password);
        const moduleId = MODULES.USER;
        await this.authService.updateUserByEmail(email, {
          ...rest,
          ...(moduleId && { moduleId }), // if roleId is not undefined then add roleId to data
          password: encryptedPassword,
          role: undefined,
        });
      } else {
        await this.authService.signUpByEmail({
          ...rest,
          email,
        });
      }
      const user = await this.authService.findUserByEmail(email);

      const backendUrl = this.configService.get<string>('BACKEND_URL');
      const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
      const registerToken = await this.jwtService.signAsync(
        {
          id: user.id,
          isMobile,
        },
        {
          secret: jwtSercret,
          expiresIn: '30d',
        },
      );
      const linkComfirm =
        backendUrl + '/api/auth/verify?token=' + registerToken;

      if (!rest.emailVerified) {
        if (!noActionSendEmail) {
          await lastValueFrom(
            this.mailService.emit(EVENTS.AUTH_REGISTER, {
              email,
              link: linkComfirm,
            }),
          );
        }
      }
      return {
        message: 'Tạo tài khoản thành công',
        status: HttpStatus.CREATED,
        user: {
          ...user,
          emailVerified: !rest.emailVerified ? false : true,
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
          message: 'Email không tồn tại',
        };
      }
      if (!user.emailVerified) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Email chưa được xác thực',
        };
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Mật khẩu không chính xác',
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
      delete user.emailVerified;
      delete user.password;
      return {
        status: HttpStatus.OK,
        message: 'Đăng nhập thành công',
        user: {
          ...user,
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
      const frontEndUrl = this.configService.get<string>('FRONTEND_URL');
      const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
      const { email } = data;
      const verifiedUser =
        await this.authService.findUserVerifiedByEmail(email);
      const confirmToken = await this.jwtService.signAsync(
        {
          ...data,
          id: verifiedUser?.id,
        },
        {
          secret: jwtSercret,
          expiresIn: '30d',
        },
      );
      const linkComfirm = frontEndUrl + '/invite-account?token=' + confirmToken;

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

  @MessagePattern(AuthCommand.USER_GET)
  async getUserInfo(data: { userId: string }) {
    try {
      const user = await this.authService.findUserById(data.userId);
      if (!user) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tài khoản không tồn tại',
        };
      }
      delete user.emailVerified;
      return {
        status: HttpStatus.OK,
        data: user,
        message: 'Lấy thông tin tài khoản thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.USER_FIND_ACCOUNT)
  async getAccount(data: { key: string; provider: string }) {
    try {
      const { key, provider } = data;
      const account = await this.authService.findAccountByProvider(
        provider,
        key,
      );
      if (!account) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tài khoản không tồn tại',
          data: null,
        };
      }
      const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
      const user = await this.authService.findUserById(account.userId);
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
        data: {
          user,
          token,
        },
        message: 'Lấy thông tin tài khoản thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.USER_CHECK_VERIFY)
  async checkVerify(data: { email: string; provider: string; key: string }) {
    try {
      const { email, provider, key } = data;
      const frontEndUrl = this.configService.get<string>('FRONTEND_URL');
      const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
      const token = await this.jwtService.signAsync(
        {
          email,
          provider,
          key,
        },
        {
          secret: jwtSercret,
          expiresIn: '30d',
        },
      );
      const linkComfirm = frontEndUrl + '/verify-user?token=' + token;

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

  @MessagePattern(AuthCommand.LINK_ACCOUNT_WITH_EMAIL)
  async linkAccountWithEmail(data: {
    email: string;
    provider: string;
    key: string;
  }) {
    try {
      const { email, provider, key } = data;
      let user: any = await this.authService.findUserVerifiedByEmail(email);
      if (!user) {
        const data = {
          password: email,
          email,
          isInputPassword: false,
        };
        user = await this.authService.signUpByEmail(data);
      }
      let account = await this.authService.findAccountByProvider(provider, key);
      if (!account) {
        account = await this.authService.createAccount({
          userId: user.id,
          provider,
          key,
        });
      }
      return {
        status: HttpStatus.OK,
        message: 'Liên kết tài khoản thành công',
        data: null,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.CHANGE_PASSWORD)
  async changePassword(data: any) {
    try {
      console.log(data);
      const { id, currentPassword, newPassword } = data;
      const user = await this.authService.findUserById(id);
      if (!user) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Người dùng không tồn tại',
        };
      }
      if (data.isReset != 'true') {
        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
          return {
            status: HttpStatus.BAD_REQUEST,
            data: null,
            message: 'Mật khẩu không chính xác',
          };
        }
      }

      const encryptedPassword = await hashPassword(newPassword);
      await this.authService.updatePassword(id, encryptedPassword);
      const newUser = await this.authService.findPasswordByUserID(id);
      if (newUser.password != encryptedPassword) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Không thể thay đổi mật khẩu',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Thay đổi mật khẩu thành công',
        data: null,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.RESET_PASSWORD_VERIFY)
  async resetPassword(data: { email: string }) {
    try {
      const email = data.email;
      const user = await this.authService.findUserVerifiedByEmail(email);
      if (!user) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Email không tồn tại',
        };
      }

      const frontEndUrl = this.configService.get<string>('FRONTEND_URL');
      const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
      const Token = await this.jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
          password: user.password,
        },
        {
          secret: jwtSercret,
          expiresIn: '30d',
        },
      );
      const linkResetPassword =
        frontEndUrl + '/cai-lai-mat-khau?token=' + Token;
      await lastValueFrom(
        this.mailService.emit(EVENTS.AUTH_REGISTER, {
          email: data.email,
          link: linkResetPassword,
        }),
      );
      return {
        link: linkResetPassword,
        status: HttpStatus.OK,
        message: 'Gửi email thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.ADD_NEW_PASSWORD)
  async addNewPassword(data: { email: string; password: string }) {
    try {
      const { email, password } = data;
      const user = await this.authService.findUserByEmail(email);
      if (!user) {
        return {
          status: HttpStatus.BAD_REQUEST,
          massage: 'Người dùng không tồn tại',
        };
      }

      if (user.isInputPassword == true) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Mật khẩu đã được tạo trước',
        };
      }

      const encryptedPassword = await hashPassword(password);
      await this.authService.addNewPassword(user.id, encryptedPassword);
      const newUser = await this.authService.findUserById(user.id);
      if (newUser.password != encryptedPassword) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Không thể thay đổi mật khẩu',
        };
      }
      delete newUser.password;
      return {
        status: HttpStatus.OK,
        message: 'Thay đổi mật khẩu thành công',
        data: newUser,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.FIND_USER_BY_EMAIL)
  async findUserByEmail(data: { email: string; emailVerified: string }) {
    try {
      const { email, emailVerified } = data;
      const users = await this.authService.findAllUserByEmail(
        email,
        emailVerified,
      );
      return {
        status: HttpStatus.OK,
        message: 'Tìm user thành công',
        data: users.map(({ password, ...user }) => user),
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.FIND_ALL_USER_BY_EMAIL)
  async findAllUserByEmail(data: { email: string }) {
    try {
      const { email } = data;
      const user = await this.authService.findUserByEmail(email);
      if (!user) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Email không tồn tại',
        };
      }
      if (!user.emailVerified) {
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
          status: HttpStatus.OK,
          message: 'Gửi email xác thực thành công',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Tìm user thành công',
        data: user,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.UPDATE_USER)
  async updateUser(data: any) {
    try {
      const { id, ...payload } = data;
      const foundUser = await this.authService.findUserById(id);
      if (!foundUser) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'User không tồn tại',
        };
      }
      const updateData: Prisma.usersUncheckedUpdateInput = {
        ...payload,
      };
      const user = await this.authService.updateUser(id, updateData);
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật user thành công',
        data: user,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.CREATE_USER_TOKEN)
  async createUserToken(data: { userId: string; token: string }) {
    try {
      const { userId, token } = data;
      const exToken = await this.authService.findUserToken(userId, token);
      if (exToken) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Token đã tồn tại',
        };
      }
      await this.authService.createUserToken(userId, token);
      return {
        status: HttpStatus.OK,
        message: 'Tạo token thành công',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.DELETE_USER_TOKEN)
  async deleteUserToken(data: { userId: string; token: string }) {
    try {
      const { userId, token } = data;
      const exToken = await this.authService.findUserToken(userId, token);
      if (!exToken) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Token không tồn tại',
        };
      }
      await this.authService.deleteUserToken(userId, token);
      return {
        status: HttpStatus.OK,
        message: 'Xóa token thành công',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(AuthCommand.GET_USER_TOKEN)
  async getUserToken(data: { userId: string }) {
    try {
      const { userId } = data;
      const tokens = await this.authService.getUserToken(userId);
      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách token thành công',
        data: tokens,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }
}
