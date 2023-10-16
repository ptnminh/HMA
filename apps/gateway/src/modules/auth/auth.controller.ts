import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    const createUserResponse = await firstValueFrom(
      this.authServiceClient.send('user_register', body),
    );
    return createUserResponse;
  }
}
