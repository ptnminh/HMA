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
  async findAll() {
    return this.prismaService.clinics.findMany({
      where: {
        isActive: true,
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
}
