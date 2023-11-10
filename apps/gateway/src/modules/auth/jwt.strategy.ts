/* eslint-disable prettier/prettier */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthCommand } from './command';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: 'thisisverysecretkey',
    });
  }

  async validate(payload: any) {
    const isTokenExpired = Date.now() >= payload.exp * 1000;
    if (isTokenExpired) {
      throw new HttpException(
        {
          status: false,
          message: 'Token has expired',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await firstValueFrom(
      this.authServiceClient.send(AuthCommand.USER_GET, { userId: payload.id }),
    );
    if (result.status !== HttpStatus.OK) {
      throw new UnauthorizedException({
        status: false,
        message: 'Unauthorized',
      });
    }
    return { ...result.data };
  }
}
