import { Injectable } from '@nestjs/common';
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
}
