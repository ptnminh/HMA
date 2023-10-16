/* eslint-disable prettier/prettier */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.SECRET_KEY,
    });
  }

  async validate(payload: any) {
    const isTokenExpired = Date.now() >= payload.exp * 1000;
    if (isTokenExpired) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Token has expired',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // const user = await this.prismaService.users.findUnique({
    //   where: { id: payload.id },
    //   include: {
    //     userRoles: {
    //       select: {
    //         roleId: true,
    //       },
    //     },
    //   },
    // });
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // return { ...user, roles: user?.userRoles };
  }
}
