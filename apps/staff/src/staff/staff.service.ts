import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AppointmentStatus } from 'src/shared';

@Injectable()
export class StaffService {
  constructor(private prismaService: PrismaService) {}

  async findAllStaff() {
    return this.prismaService.staffs.findMany({
      where: {
        isDisabled: false,
      },
      orderBy: {
        userInClinics: {
          userId: 'desc',
        },
      },
    });
  }

  async createStaff(memberId: number) {
    console.log(memberId);
    return this.prismaService.staffs.create({
      data: {
        memberId,
      },
    });
  }

  async deleteStaff(id: number) {
    return this.prismaService.staffs.update({
      where: {
        id,
      },
      data: {
        isDisabled: true,
      },
    });
  }

  async findStaffById(id: number) {
    return this.prismaService.staffs.findFirst({
      where: {
        id,
        isDisabled: false,
      },
      include: {
        userInClinics: true,
        staffSchedules: true,
      },
    });
  }

  async updateStaff(id: number, data: Prisma.staffsUncheckedUpdateInput) {
    return this.prismaService.staffs.update({
      where: {
        id,
      },
      data,
    });
  }

  async findStaffByUserId(userId: string) {
    console.log(userId);
    return this.prismaService.staffs.findMany({
      where: {
        isDisabled: false,
        userInClinics: {
          userId,
        },
      },
      include: {
        userInClinics: true,
      },
    });
  }

  async createSchedule(payload: Prisma.staffSchedulesUncheckedCreateInput) {
    return this.prismaService.staffSchedules.create({
      data: {
        ...payload,
      },
    });
  }

  async updateSchedule(
    payload: Prisma.staffSchedulesUncheckedUpdateInput,
    id: number,
  ) {
    return this.prismaService.staffSchedules.update({
      where: {
        id,
      },
      data: {
        ...payload,
      },
    });
  }

  async findScheduleByStaffId(staffId: number) {
    return this.prismaService.staffSchedules.findMany({
      where: {
        staffId,
        isDisabled: false,
      },
      select: {
        id: true,
        staffId: true,
        day: true,
        startTime: true,
        endTime: true,
      },
      orderBy: {
        day: 'asc',
      },
    });
  }

  async findScheduleById(id: number) {
    return this.prismaService.staffSchedules.findFirst({
      where: {
        id,
        isDisabled: false,
      },
    });
  }

  async deleteSchedule(id: number) {
    return this.prismaService.staffSchedules.update({
      where: {
        id,
      },
      data: {
        isDisabled: true,
      },
    });
  }

  async createAppointment(payload: Prisma.appointmentsUncheckedCreateInput) {
    return this.prismaService.appointments.create({
      data: {
        ...payload,
        status: AppointmentStatus.NOT_CONFIRMED,
      },
    });
  }
}
