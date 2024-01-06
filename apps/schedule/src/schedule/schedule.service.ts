import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ScheduleService {
    constructor(private prismaService: PrismaService) {}
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
