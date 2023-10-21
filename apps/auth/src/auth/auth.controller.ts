import { Controller, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';
import { AuthCommand } from './command';
import { RegisterDto } from './dto/create-user.dto';
import { comparePassword, hashPassword } from 'src/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
        const user = await this.authService.findUserByEmail(email);
        return {
          message: 'Create user successfully',
          status: HttpStatus.CREATED,
          user: {
            ...data,
            id: user.id,
          },
        };
      }
      const user = await this.authService.signUpByEmail(data);

      return {
        message: 'Create user successfully',
        status: HttpStatus.CREATED,
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
      return {
        status: HttpStatus.OK,
        message: 'Login successfully',
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
}
