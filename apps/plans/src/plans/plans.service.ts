import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlanService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPlan(data: Prisma.plansUncheckedCreateInput) {
    return await this.prismaService.plans.create({
      data,
    });
  }

  async updatePlan(id, data: Prisma.plansUncheckedUpdateInput) {
    return await this.prismaService.plans.update({
      where: {
        id,
      },
      data,
    });
  }

  async createOption(data: Prisma.optionsUncheckedCreateInput) {
    return await this.prismaService.options.create({
      data,
    });
  }

  async findAllActiveOption() {
    return await this.prismaService.options.findMany({
      where: {
        isActive: true,
      }
    })
  }

  async findPlanById(id: number) {
    return await this.prismaService.plans.findUnique({
      where: {
        id,
      }
    })
  }

  async findAllPlan() {
    return this.prismaService.plans.findMany( {
      include: {
        planOptions: true
        }
      }
    )
  }
}
