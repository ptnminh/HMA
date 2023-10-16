import { Controller, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';
import { AuthCommand } from './command';
import { RegisterDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AuthCommand.USER_CREATE)
  async register(data: RegisterDto) {
    const { email } = data;
    const exUser = await this.authService.findUserVerifiedByEmail(email);
    if (exUser) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Email already exists',
        errors: true,
      };
    }
    const user = await this.authService.signUpByEmail(data);
    return {
      message: 'Create user successfully',
      status: HttpStatus.CREATED,
      user,
    };
  }
}
