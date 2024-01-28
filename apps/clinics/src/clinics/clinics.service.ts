import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { map } from 'lodash';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ClinicService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPermissionOfClinicByOwnerId(ownerId: string, clinicId: string) {
    return this.prismaService.clinics.findFirst({
      where: {
        id: clinicId,
      },
      select: {
        id: true,
        name: true,
        clinicGroupRoles: {
          select: {
            id: true,
            name: true,
            description: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    optionName: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async create(data: any) {
    return this.prismaService.clinics.create({
      data,
    });
  }

  async updateSubscribePlan(
    id: string,
    data: Prisma.subscriptionsUncheckedUpdateInput,
  ) {
    return this.prismaService.subscriptions.update({
      where: {
        id,
      },
      data,
    });
  }

  async getPermissions(takeAll: boolean = false) {
    return this.prismaService.options.findMany({
      where: {
        isActive: true,
        ...(takeAll ? {} : { isServiceOption: false }),
      },
    });
  }

  async createRolePermissions({
    roleId,
    permissionId,
  }: Prisma.rolePermissionsUncheckedCreateInput) {
    return this.prismaService.rolePermissions.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }
  async createClinicGroupRoles(
    payload: Prisma.clinicGroupRolesUncheckedCreateInput,
  ) {
    return this.prismaService.clinicGroupRoles.create({
      data: payload,
    });
  }

  async getPlanDetail(id: number) {
    return this.prismaService.plans.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(
    userId: string,
    query: {
      ownerId?: string;
      staffId?: number;
      name?: string;
      address?: string;
      isActive?: boolean;
    } | null = {},
  ) {
    if (Object.keys(query).length !== 0) {
      const { ownerId, staffId, name, address, isActive } = query;
      return this.prismaService.clinics.findMany({
        where: {
          ...(ownerId ? { ownerId } : {}),
          ...(staffId
            ? {
                staffs: {
                  some: {
                    id: staffId,
                  },
                },
              }
            : {}),
          ...(name ? { name: { contains: name } } : {}),
          ...(address ? { address: { contains: address } } : {}),
          ...(isActive ? { isActive } : {}),
        },
        include: {
          subscriptions: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              plans: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
    return this.prismaService.clinics.findMany({
      where: {
        isActive: true,
        staffs: {
          some: {
            userId,
            isDisabled: false,
          },
        },
      },
      include: {
        subscriptions: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            plans: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findClinics() {
    return this.prismaService.clinics.findMany({
      where: {
        isActive: true,
      },
      include: {
        subscriptions: true,
      },
    });
  }
  async addUserToClinic(data: Prisma.staffsUncheckedCreateInput) {
    return this.prismaService.staffs.create({
      data,
    });
  }
  async update(id: string, data: any) {
    return this.prismaService.clinics.update({
      where: {
        id,
      },
      data,
      include: {
        subscriptions: true,
      },
    });
  }

  async findAllUserInClinic(clinicId: string) {
    return this.prismaService.staffs.findMany({
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
      },
    });
  }

  async findUserInClinic(clinicId: string, userId: string) {
    return this.prismaService.staffs.findFirst({
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
      },
    });
  }

  async findClinicById(id: string) {
    return this.prismaService.clinics.findUnique({
      where: {
        id,
      },
      include: {
        subscriptions: {
          orderBy: {
            updatedAt: 'desc',
          },
          include: {
            plans: true,
          },
        },
        staffs: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async getSubscription(subscribePlanId: string) {
    return this.prismaService.subscriptions.findUnique({
      where: {
        id: subscribePlanId,
      },
      include: {
        plans: true,
        clinics: true,
      },
    });
  }

  async subcribePlan(data: Prisma.subscriptionsUncheckedCreateInput) {
    return this.prismaService.subscriptions.create({
      data,
    });
  }

  async findClinicGroupRoleByClinicId(clinicId: string) {
    return this.prismaService.clinicGroupRoles.findMany({
      where: {
        clinicId,
        isDisabled: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        rolePermissions: {
          select: {
            permission: {
              select: {
                id: true,
                optionName: true,
                description: true,
              },
            },
          },
        },
      },
    });
  }

  async findClinicGroupRoleById(id: number) {
    return this.prismaService.clinicGroupRoles.findFirst({
      where: {
        id,
      },
      include: {
        staffs: true,
      },
    });
  }
  async findPermissionsByRoleId(roleId: number) {
    return this.prismaService.rolePermissions.findMany({
      where: {
        roleId,
      },
      select: {
        permission: {
          select: {
            id: true,
            optionName: true,
            description: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateClinicGroupRole(payload: {
    where: Prisma.clinicGroupRolesWhereUniqueInput;
    data: Prisma.clinicGroupRolesUncheckedUpdateInput;
  }) {
    return this.prismaService.clinicGroupRoles.update(payload);
  }

  async deleteAllRolePermissions(roleId: number) {
    return this.prismaService.rolePermissions.deleteMany({
      where: {
        roleId,
      },
    });
  }

  async createClinicService(data: Prisma.clinicServicesUncheckedCreateInput) {
    return this.prismaService.clinicServices.create({
      data,
    });
  }

  async findClinicServiceByClinicId(clinicId: string) {
    return this.prismaService.clinicServices.findMany({
      where: {
        isDisabled: false,
        clinicId,
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

  async updateClinicService(
    id: number,
    data: Prisma.staffServicesUncheckedUpdateInput,
  ) {
    return this.prismaService.clinicServices.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteClinicService(id: number) {
    return this.prismaService.clinicServices.update({
      where: {
        id,
      },
      data: {
        isDisabled: true,
      },
    });
  }

  async getAppointments({
    doctorId,
    date,
    status,
    clinicId,
    patientId,
  }: {
    doctorId?: number;
    date?: string;
    status?: string;
    patientId?: string;
    clinicId?: string;
  }) {
    const where: any = {
      ...(doctorId ? { doctorId } : {}),
      ...(date ? { date } : {}),
      ...(status ? { status } : {}),
      ...(patientId ? { patientId } : {}),
      ...(clinicId ? { clinicId } : {}),
    };
    const appointments = await this.prismaService.appointments.findMany({
      where,
      include: {
        staffs: {
          select: {
            users: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        patients: {
          include: {
            patient: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                address: true,
                avatar: true,
                phone: true,
              },
            },
          },
        },
      },
    });
    return map(appointments, (appointment: any) => {
      const { staffs, patients, ...rest }: any = appointment;
      const { patient, ...restPatient }: any = patients;
      const { id: userId, ...restPatientInfo }: any = patient;
      return {
        ...rest,
        doctor: staffs?.userInClinics?.users,
        patient: {
          ...restPatient,
          userId,
          ...restPatientInfo,
        },
      };
    });
  }

  async updateAppointment(
    appointmentId: number,
    data: Prisma.appointmentsUncheckedUpdateInput,
  ) {
    return this.prismaService.appointments.update({
      where: {
        id: appointmentId,
      },
      data,
    });
  }

  async findAppointmentById(appointmentId: number) {
    const appointment = await this.prismaService.appointments.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        staffs: {
          select: {
            users: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        patients: {
          include: {
            patient: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                address: true,
                avatar: true,
                phone: true,
              },
            },
          },
        },
      },
    });
    if (!appointment) {
      return null;
    }
    const { staffs, patients, ...rest }: any = appointment;
    const { patient, ...restPatient }: any = patients;
    const { id: userId, ...restPatientInfo }: any = patient;
    return {
      ...rest,
      doctor: staffs?.userInClinics?.users,
      patient: {
        ...restPatient,
        userId,
        ...restPatientInfo,
      },
    };
  }
  async createAppointment(data: Prisma.appointmentsUncheckedCreateInput) {
    return this.prismaService.appointments.create({
      data,
    });
  }

  async findAllStaffInClinic(clinicId: string) {
    return this.prismaService.staffs.findMany({
      where: {
        isDisabled: false,
        clinicId,
      },
    });
  }
}
