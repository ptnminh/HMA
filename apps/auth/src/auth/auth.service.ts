import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterDto } from './dto/create-user.dto';
import { MODULES, hashPassword } from '../shared/';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserVerifiedByEmail(email: string): Promise<any> {
    return this.prismaService.users.findFirst({
      where: {
        email,
        emailVerified: true,
      },
    });
  }

  async updateUser(id: string, data): Promise<any> {
    return this.prismaService.users.update({
      where: {
        id,
      },
      data,
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
        isInputPassword: true,
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
        isInputPassword: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        moduleId: true,
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
    const { password, moduleId, ...rest } = createUserDTO;
    const encryptedPassword = await hashPassword(password);
    return this.prismaService.users.create({
      data: {
        password: encryptedPassword as string,
        moduleId: moduleId ? moduleId : (MODULES.USER as number as number),
        ...rest,
      },
      select: {
        id: true,
        isInputPassword: true,
        email: true,
        moduleId: true,
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

  async createAccount(data) {
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

  async findUserById(id: string) {
    return this.prismaService.users.findUnique({
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
        moduleId: true,
        isInputPassword: true,
      },
    });
  }

  async updatePassword(id: string, newPassword: string) {
    return this.prismaService.users.update({
      where: {
        id,
        emailVerified: true,
      },
      data: {
        password: newPassword,
      },
    });
  }

  async findPasswordByUserID(userID: string) {
    return this.prismaService.users.findFirst({
      where: {
        id: userID,
        emailVerified: true,
      },
      select: {
        id: true,
        password: true,
      },
    });
  }

  async addNewPassword(id: string, password: string) {
    return this.prismaService.users.update({
      where: {
        id,
      },
      data: {
        password,
        isInputPassword: true,
      },
    });
  }

  async findUserToken(userId: string, token: string) {
    return this.prismaService.userDeviceTokens.findFirst({
      where: {
        userId,
        token,
      },
    });
  }

  async createUserToken(userId: string, token: string) {
    return this.prismaService.userDeviceTokens.create({
      data: {
        userId,
        token,
      },
    });
  }

  async deleteUserToken(userId: string, token: string) {
    return this.prismaService.userDeviceTokens.deleteMany({
      where: {
        userId,
        token,
      },
    });
  }

  async getUserToken(userId: string) {
    return this.prismaService.userDeviceTokens.findMany({
      where: {
        userId,
      },
    });
  }

  async findScheduleById(id: number) {
    return this.prismaService.userSchedules.findUnique({
        where: {
            id,
            isDisabled: false
        }
    })
}

async findScheduleByUserId(userId: string) {
    return this.prismaService.userSchedules.findMany({
        where: {
            userId,
            isDisabled: false
        }
    })
}

async createSchedule(payload: Prisma.userSchedulesUncheckedCreateInput) {
    return this.prismaService.userSchedules.create({
        data: {
            ...payload,
        }
    })
}

async deleteSchedule(id: number) {
    return this.prismaService.userSchedules.update({
        where: {
            id,
        },
        data: {
            isDisabled: true,
        }
    })
}

async updateSchedule(id: number, data: Prisma.userSchedulesUncheckedUpdateInput) {
    return this.prismaService.userSchedules.update({
        where: {
            id,
        },
        data,
    })
}


}
