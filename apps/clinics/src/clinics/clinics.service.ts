import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ClinicService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPermissionOfClinicByOwnerId(ownerId: string, clinicId: string) {
    return this.prismaService.clinics.findFirst({
      where: {
        ownerId,
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

  async findAll(ownerId) {
    return this.prismaService.clinics.findMany({
      where: {
        isActive: true,
        ownerId,
        subscriptions: {
          some: {
            NOT: {
              status: {
                in: [4],
              },
            },
          },
        },
      },
      include: {
        subscriptions: {
          orderBy: {
            createdAt: 'desc',
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
    return this.prismaService.clinics.findFirst({
      where: {
        id,
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
}
