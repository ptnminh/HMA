import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isNumber } from 'lodash';
import { PrismaService } from 'src/prisma.service';
import { AppointmentStatus } from 'src/shared';
import { convertVietnameseString } from './utils';

@Injectable()
export class StaffService {
  constructor(private prismaService: PrismaService) {}

  async createUser(data: Prisma.usersUncheckedCreateInput) {
    return this.prismaService.users.create({
      data,
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
      select: {
        id: true,
        specialize: true,
        experience: true,
        description: true,
        staffServices: {
          where: {
            isDisabled: false,
          },
          include: {
            clinicServices: true,
          },
        },
        staffSchedules: {
          where: {
            isDisabled: false,
          },
          select: { day: true, startTime: true, endTime: true },
        },
        clinics: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            phone: true,
          },
        },
        users: true,
        role: {
          select: {
            id: true,
            name: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    optionName: true,
                    isServiceOption: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAppointmentByStaffId(staffId: number, date?: string) {
    return this.prismaService.appointments.findMany({
      where: {
        doctorId: staffId,
        isDisabled: false,
        ...(date ? { date } : {}),
      },
      include: {
        patients: {
          select: {
            id: true,
            userId: true,
            patient: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
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

  async findClinicServiceById(id: number) {
    return this.prismaService.clinicServices.findFirst({
      where: {
        id,
        isDisabled: false,
        deletedAt: null,
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

  async searchStaff(query) {
    const { userId, clinicId, roleId, gender, phoneNumber, email, name } = query;
    const staffs = await this.prismaService.staffs.findMany({
      where: {
        clinicId: clinicId? clinicId : undefined,
        roleId: roleId? roleId : undefined,
        isDisabled: false,
        AND: [
          {
            users: (gender !== undefined  && gender !== null)? { gender, } : undefined,
          },
          {
            users: phoneNumber?
               { phone: { contains: phoneNumber } }
              : undefined,
          },
          {
            users: userId? { id: userId } : undefined,
          },
          {
            users: email? { email: { contains: email } } : undefined,
          },
        ],
      },
      select: {
        id: true,
        experience: true,
        description: true,
        specialize: true,
        clinicId: true,
        users: true,
        role: {
          select: {
            id: true,
            name: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    optionName: true,
                    isServiceOption: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    var searchWithName = []
    if (name) {
      for (var staff of staffs) {
        if (staff.users) 
        {
          const strName = convertVietnameseString(staff.users.firstName) 
          + ' '
          + convertVietnameseString(staff.users.lastName);
          if(strName.includes(convertVietnameseString(name))) {
            searchWithName.push(staff)
          }
        }

      }
    }
    return name? searchWithName : staffs;
  }

  async findAllStaff() {
    return this.prismaService.staffs.findMany({
      where: {
        isDisabled: false,
      },
      select: {
        id: true,
        clinicId: true,
        experience: true,
        description: true,
        specialize: true,
        users: true,
        role: {
          select: {
            id: true,
            name: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    optionName: true,
                    isServiceOption: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
