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
      include: {
        planOptions: {
          select: {
            id: true,
          },
        },
      },
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
      },
    });
  }

  async findPlanById(id: number) {
    return await this.prismaService.plans.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        planName: true,
        currentPrice: true,
        description: true,
        isActive: true,
        updatedAt: true,
        createdAt: true,
        planOptions: {
          select: {
            plan: true,
          },
        },
      },
    });
  }

  async findAllPlan() {
    return this.prismaService.plans.findMany({
      select: {
        id: true,
        planName: true,
        currentPrice: true,
        description: true,
        isActive: true,
        updatedAt: true,
        createdAt: true,
        planOptions: {
          select: {
            plan: true,
          },
        },
      },
    });
  }
  async createPlanOption(planId: number, optionIds: number[]) {
    const data = optionIds.map((optionId) => ({
      planId,
      optionId,
    }));
    return await this.prismaService.planOptions.createMany({
      data,
    });
  }

  async deletePlanOption(planId: number) {
    return await this.prismaService.planOptions.deleteMany({
      where: {
        planId,
      },
    });
  }
}
