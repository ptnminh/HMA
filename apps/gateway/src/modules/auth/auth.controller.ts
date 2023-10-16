import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RegisterDto, RegisterResponse } from './dto/create-user.dto';
import { AuthCommand } from './command';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
  ) {}

  @Post('register')
  @ApiCreatedResponse({
    type: RegisterResponse,
  })
  async register(@Body() body: RegisterDto) {
    const createUserResponse = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_CREATE, body),
    );
    console.log('hello');
    return createUserResponse;
  }
}
