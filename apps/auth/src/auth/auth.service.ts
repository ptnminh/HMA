import { Injectable } from '@nestjs/common';
import { Prisma, users } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { RegisterDto } from './dto/create-user.dto';
import { ROLES, hashPassword } from '../shared/';

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

  async findUserVerifiedById(id: string): Promise<any> {
    return this.prismaService.users.findFirst({
      where: {
        id,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        role: {
          select: {
            name: true,
          },
        },
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
        password: true,
        emailVerified: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }
  async updateUserByEmail(email: string, data): Promise<any> {
    return this.prismaService.users.updateMany({
      where: {
        email,
      },
      data,
    });
  }

  async signUpByEmail(createUserDTO: RegisterDto) {
    const { password, role, ...rest } = createUserDTO;
    const roleId = ROLES[role?.toUpperCase() || 'USER'];
    const encryptedPassword = await hashPassword(password);
    return this.prismaService.users.create({
      data: {
        password: encryptedPassword as string,
        roleId: roleId ? roleId : (ROLES.USER as number as number),
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

  async verifyEmail(id: string) {
    return this.prismaService.users.update({
      where: { id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
      },
    });
  }

  async createAccount(data: Prisma.accountsUncheckedCreateInput) {
    return this.prismaService.accounts.create({
      data,
    });
  }

  async findAccountByUserId(userId: string, provider: string) {
    return this.prismaService.accounts.findFirst({
      where: {
        userId,
        provider,
      },
    });
  }

  async findAccountByProvider(provider: string, key: string) {
    return this.prismaService.accounts.findFirst({
      where: {
        provider,
        key,
      },
    });
  }

  async getAllAccounts(userId) {
    return this.prismaService.accounts.findMany({
      where: {
        isDisabled: false,
        userId,
      },
      select: {
        id: true,
        key: true,
        provider: true,
        avatar: true,
      },
    });
  }

  async deleteAccount(accountId: string) {
    return this.prismaService.accounts.update({
      where: {
        id: accountId,
      },
      data: {
        isDisabled: true,
        disabledAt: new Date().toISOString(),
      },
    });
  }
  async getAllUsers() {
    return this.prismaService.users.findMany({
      where: {
        isDisabled: false,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        name: true,
        firstName: true,
        lastName: true,
      }
    })
  }

  async getAllPermission() {
    return this.prismaService.permissions.findMany({
      where: {
        isDisabled: false,
      },
      select: {
        id: true,
        permission: true,
        description: true,
        createdAt: true,
      }
    })
  }
}
