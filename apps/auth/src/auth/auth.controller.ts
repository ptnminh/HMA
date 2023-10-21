import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { AuthCommand } from './command';
import { RegisterDto } from './dto/create-user.dto';
import { EVENTS, comparePassword, hashPassword } from 'src/shared';
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
      const token = await this.jwtService.signAsync(
        {
          ...user,
        },
        {
          secret: jwtSercret,
        },
      );
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
        token,
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
        errors: true,
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
          errors: true,
        };
      }
      if (!user.emailVerified) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Email is not verified',
          errors: true,
        };
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Password is not correct',
          errors: true,
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
        errors: null,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        errors: true,
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
        errors: null,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        errors: true,
      };
    }
  }

  @MessagePattern(AuthCommand.USER_CONFIRM)
  async confirmAccount(data: { email: string; role: string }) {
    try {
      // create user with email and password is email
      const backendUrl = this.configService.get<string>('BACKEND_URL');
      const jwtSercret = this.configService.get<string>('JWT_SECRET_KEY');
      const { email } = data;
      const password = email;
      const exUser = await this.authService.findUserByEmail(email);
      if (exUser) {
        const encryptedPassword = await hashPassword(password);

        await this.authService.updateUserByEmail(email, {
          roleId: 4,
          password: encryptedPassword,
        });
      } else {
        await this.authService.signUpByEmail({ password, email });
      }
      const user = await this.authService.findUserByEmail(email);

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
        message: 'Gửi mail thành công',
        link: linkComfirm,
        errors: null,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        errors: true,
      };
    }
  }
}
