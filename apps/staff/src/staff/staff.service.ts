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

  async createStaff(data: Prisma.staffsUncheckedCreateInput) {
    return this.prismaService.staffs.create({
      data,
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
        isDisabled: false,
        id,
      },
      include: {
        staffServices: {
          where: {
            isDisabled: false,
          },
        },
        staffSchedules: {
          where: {
            isDisabled: false,
          },
        },
      },
    });
  }

  async findAppointmentByStaffId(staffId: number) {
    return this.prismaService.appointments.findMany({
      where: {
        doctorId: staffId,
        isDisabled: false,
      },
      include: {
        patients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findStaffByMemberId(memberId: number) {
    return this.prismaService.staffs.findFirst({
      where: {
        isDisabled: false,
        memberId,
      },
      include: {
        userInClinics: {
          select: {
            clinicId: true,
            userId: true,
            users: {
              select: {
                name: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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

  async findUserInClinic(id: number) {
    return this.prismaService.userInClinics.findFirst({
      where: {
        isDisabled: false,
        id,
      },
    });
  }

  async findClinicServiceById(id: number) {
    return this.prismaService.clinicServices.findFirst({
      where: {
        id,
        isDisabled: false,
      },
    });
  }

  async findStaffServiceByStaffId(staffId: number) {
    return this.prismaService.staffServices.findMany({
      where: {
        staffId,
        isDisabled: false,
      },
    });
  }

  async createStaffService(data: Prisma.staffServicesUncheckedCreateInput) {
    return this.prismaService.staffServices.create({
      data,
    });
  }

  async deleteStaffServiceByStaffId(staffId: number) {
    return this.prismaService.staffServices.updateMany({
      where: {
        staffId,
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
