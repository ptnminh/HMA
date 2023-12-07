import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ClinicService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: any) {
    return this.prismaService.clinics.create({
      data,
    });
  }
  async findAll(ownerId) {
    return this.prismaService.clinics.findMany({
      where: {
        isActive: true,
        ownerId,
      },
    });
  }
  async addUserToClinic(data: Prisma.userInClinicsUncheckedCreateInput) {
    return this.prismaService.userInClinics.create({
      data,
    });
  }
  async update(id: string, data: any) {
    return this.prismaService.clinics.update({
      where: {
        id,
      },
      data,
    });
  }

  async findAllUserInClinic(clinicId: string) {
    return this.prismaService.userInClinics.findMany({
      where: {
        clinicId,
        isDisabled: false,
      },
      select: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        isOwner: true,
      },
    });
  }

  async findUserInClinic(clinicId: string, userId: string) {
    return this.prismaService.userInClinics.findFirst({
      where: {
        clinicId,
        userId,
        isDisabled: false,
      },
      select: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        isOwner: true,
      },
    });
  }

  async findClinicById(id: string) {
    return this.prismaService.clinics.findFirst({
      where: {
        id,
      },
    });
  }

  async subcribePlan(data: Prisma.subscriptionsUncheckedCreateInput) {
    return this.prismaService.subscriptions.create({
      data,
    });
  }
}
