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

  async findAll(userId: string) {
    return this.prismaService.clinics.findMany({
      where: {
        isActive: true,
        userInClinics: {
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
      include: {
        subscriptions: true,
      },
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
        userInClinics: {
          where: {
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
        userInClinics: true,
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

  async getAppointments({
    doctorId,
    date,
    status,
    clinicId,
  }: {
    doctorId?: string;
    date?: string;
    status?: string;
    clinicId?: string;
  }) {
    const where: any = {
      ...(doctorId ? { doctorId } : {}),
      ...(date ? { date } : {}),
      ...(status ? { status } : {}),
      clinicId,
    };
    const appointments = this.prismaService.appointments.findMany({
      where,
      include: {
        staffs: {
          select: {
            userInClinics: {
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
          },
        },
      },
    });
    return map(appointments, (appointment: any) => {
      const { staffs, ...rest }: any = appointment;
      return {
        ...rest,
        user: staffs?.userInClinics?.users,
      };
    });
  }
}
