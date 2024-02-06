import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { map } from 'lodash';
import { PrismaService } from 'src/prisma.service';
import { convertVietnameseString } from './utils';
import { now } from 'moment';

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
      isActive?: string;
      suid?: string;
      puid?: string;
    } | null = {},
  ) {
    try {
      if (Object.keys(query).length !== 0) {
        const { ownerId, staffId, name, address, isActive, suid, puid } = query;
        const where = {
          ...(ownerId ? { ownerId } : {}),
          ...(staffId
            ? {
                staffs: {
                  some: {
                    id: +staffId,
                  },
                },
              }
            : {}),
          ...(name ? { name: { contains: name } } : {}),
          ...(address ? { address: { contains: address } } : {}),
          ...(isActive ? { isActive: isActive === 'true' ? true : false } : {}),
          ...(suid
            ? {
                staffs: {
                  some: {
                    userId: suid,
                  },
                },
              }
            : {}),
          ...(puid
            ? {
                patients: {
                  some: {
                    userId: puid,
                  },
                },
              }
            : {}),
        };
        const clinics = await this.prismaService.clinics.findMany({
          where,
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
        return clinics;
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
    } catch (error) {
      console.log(error);
    }
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
        owner: true,
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

  async findClinicServiceByClinicId(clinicId: string, isDisabled: boolean) {
    return this.prismaService.clinicServices.findMany({
      where: {
        isDisabled: isDisabled !== undefined ? isDisabled : undefined,
        clinicId,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findClinicServiceById(id: number) {
    return this.prismaService.clinicServices.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
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
        deletedAt: new Date(now()),
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

  async createCategory(data: Prisma.categoryUncheckedCreateInput) {
    return this.prismaService.category.create({
      data,
    });
  }

  async updateCategory(data: Prisma.categoryUncheckedUpdateInput, id: number) {
    return this.prismaService.category.update({
      where: {
        id,
      },
      data,
    });
  }

  async findCategoryById(id: number) {
    return this.prismaService.category.findFirst({
      where: {
        id,
        isDisabled: false,
      },
    });
  }

  async searchCategory(clinicId: string, name?: string, type?: number) {
    try {
      const result = [];
      const categories = await this.prismaService.category.findMany({
        where: {
          type: type ? type : undefined,
          isDisabled: false,
          clinicId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (name) {
        for (const category of categories) {
          const strName = convertVietnameseString(category.name);
          if (strName.includes(convertVietnameseString(name))) {
            result.push(category);
          }
        }
      }
      return name ? result : categories;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteCategory(id: number) {
    return this.prismaService.category.update({
      where: {
        id,
      },
      data: {
        isDisabled: true,
      },
    });
  }

  async updateClinicServiceByCategoryId(categoryId: number, data) {
    return this.prismaService.clinicServices.updateMany({
      where: {
        categoryId,
      },
      data,
    });
  }

  async updateMedicalSuppliersByCategoryId(categoryId: number, data) {
    return this.prismaService.medicalSupplies.updateMany({
      where: {
        categoryId,
      },
      data,
    });
  }

  async createNews(data: Prisma.clinicNewsUncheckedCreateInput) {
    return this.prismaService.clinicNews.create({
      data,
    });
  }

  async findNewsById(id: number) {
    return this.prismaService.clinicNews.findFirst({
      where: {
        id,
      },
    });
  }

  async updateNews(id: number, data: Prisma.clinicNewsUncheckedUpdateInput) {
    return this.prismaService.clinicNews.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteNews(id: number) {
    return this.prismaService.clinicNews.delete({
      where: {
        id,
      },
    });
  }

  async searchNews(clinicId?: string, title?: string, isShow?: boolean) {
    try {
      const result = [];
      const newsList = await this.prismaService.clinicNews.findMany({
        where: {
          isShow: isShow !== undefined ? isShow : undefined,
          clinicId: clinicId ? clinicId : undefined,
        },
        include: {
          clinics: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (title) {
        for (const news of newsList) {
          const titleStr = convertVietnameseString(news.title);
          if (titleStr.includes(convertVietnameseString(title))) {
            result.push(news);
          }
        }
      }
      return title ? result : newsList;
    } catch (error) {
      console.log(error);
    }
  }

  async createMedicalSupplier(
    data: Prisma.medicalSuppliesUncheckedCreateInput,
  ) {
    return this.prismaService.medicalSupplies.create({
      data,
    });
  }

  async findMedicalSupplyByName(name: string) {
    return this.prismaService.medicalSupplies.findFirst({
      where: {
        medicineName: name,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async listMedicalSupplier({
    vendor,
    medicineName,
    isDisabled,
    clinicId,
  }: {
    vendor?: string;
    medicineName?: string;
    isDisabled?: string;
    clinicId?: string;
  }) {
    let isDisabledValue = null;
    if (isDisabled) {
      isDisabledValue = isDisabled === 'true' ? true : false;
    }
    return this.prismaService.medicalSupplies.findMany({
      where: {
        ...(medicineName ? { medicineName: { contains: medicineName } } : {}),
        ...(vendor ? { vendor: { contains: vendor } } : {}),
        ...(isDisabledValue !== null ? { isDisabled: isDisabledValue } : {}),
        ...(clinicId ? { clinicId } : {}),
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findMedicalSupplierById(id: number) {
    return this.prismaService.medicalSupplies.findUnique({
      where: {
        id,
        isDisabled: false,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async updateMedicalSupplier(
    id: number,
    data: Prisma.medicalSuppliesUncheckedUpdateInput,
  ) {
    return this.prismaService.medicalSupplies.update({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      data,
    });
  }


  async searchPatient(query: any) {
    try {
      const {name, userId, clinicId, gender, phone, email} = query
      const patients = await this.prismaService.patients.findMany({
        where: {
          userId: userId? userId : undefined,
          clinicId: clinicId? clinicId : undefined,
          patient: {
            gender: gender? gender : undefined,
            phone: phone? phone : undefined,
            email: email? email : undefined,
          }

        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              gender: true,
              phone: true,
              address: true,
              emailVerified: true,
              avatar: true,
            }
          },
        }
      })
      const returnData = []
      if (name) {
        for (var member of patients) {
          const strName = convertVietnameseString(member.patient.firstName) 
          + ' '
          + convertVietnameseString(member.patient.lastName);
          if (strName.includes(convertVietnameseString(name))) {
            returnData.push(member)
          }
        }
      }
      return name? returnData : patients;
    }
    catch(error) {
      console.log(error)
    }
  }
}
