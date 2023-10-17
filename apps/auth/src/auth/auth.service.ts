import { Injectable } from '@nestjs/common';
import { users } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { RegisterDto } from './dto/create-user.dto';
import { ROLES, hashPassword } from '..//shared/';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserVerifiedByEmail(email: string): Promise<users | null> {
    return this.prismaService.users.findFirst({
      where: {
        email,
        emailVerified: true,
      },
    });
  }

  async findUserByEmail(email: string): Promise<any> {
    return this.prismaService.users.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async signUpByEmail(createUserDTO: RegisterDto) {
    const { password, ...rest } = createUserDTO;
    const encryptedPassword = await hashPassword(password);
    return this.prismaService.users.create({
      data: {
        password: encryptedPassword as string,
        roleId: ROLES.USER,
        ...rest,
      },
      select: {
        id: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
