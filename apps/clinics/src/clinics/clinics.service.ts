import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { map } from 'lodash';
import { PrismaService } from 'src/prisma.service';
import { convertVietnameseString } from './utils';
import { now } from 'moment';
import * as moment from 'moment-timezone';

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

  async findUsersInClinic(clinicId: string) {
    return this.prismaService.staffs.findMany({
      where: {
        clinicId,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
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
        staffServices: {
          select: {
            staffId: true,
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
        staffServices: {
          select: {
            staffId: true,
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
          include: {
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
                gender: true,
                birthday: true,
              },
            },
          },
        },
        clinics: true,
        clinicServices: true,
      },
    });
    return map(appointments, (appointment: any) => {
      const { staffs, patients, ...rest }: any = appointment;
      const { id: staffId, users, ...restStaff }: any = staffs;
      const { id: doctorId, ...restUserInfo } = users;
      const { patient, ...restPatient }: any = patients;
      const { id: userId, ...restPatientInfo }: any = patient;
      return {
        ...rest,
        doctor: {
          ...restStaff,
          staffId,
          doctorId,
          ...restUserInfo,
        },
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
          include: {
            users: {
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
                gender: true,
                birthday: true,
              },
            },
          },
        },
        clinics: true,
        clinicServices: true,
      },
    });
    if (!appointment) {
      return null;
    }
    const { staffs, patients, ...rest }: any = appointment;
    const { id: staffId, users, ...restStaff }: any = staffs;
    const { id: doctorId, ...restUserInfo } = users;
    const { patient, ...restPatient }: any = patients;
    const { id: userId, ...restPatientInfo }: any = patient;
    return {
      ...rest,
      doctor: {
        ...restStaff,
        staffId,
        doctorId,
        ...restUserInfo,
      },
      patient: {
        ...restPatient,
        userId,
        ...restPatientInfo,
      },
    };
  }
  async createAppointment(data: Prisma.appointmentsUncheckedCreateInput) {
    const appointment = await this.prismaService.appointments.create({
      data,
      include: {
        staffs: {
          include: {
            users: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                address: true,
                avatar: true,
                phone: true,
                gender: true,
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
                gender: true,
                birthday: true,
              },
            },
          },
        },
        clinics: true,
        clinicServices: true,
      },
    });
    if (!appointment) {
      return null;
    }
    const { staffs, patients, ...rest }: any = appointment;
    const { id: staffId, users, ...restStaff }: any = staffs;
    const { id: doctorId, ...restUserInfo } = users;
    const { patient, ...restPatient }: any = patients;
    const { id: userId, ...restPatientInfo }: any = patient;
    return {
      ...rest,
      doctor: {
        ...restStaff,
        staffId,
        doctorId,
        ...restUserInfo,
      },
      patient: {
        ...restPatient,
        userId,
        ...restPatientInfo,
      },
    };
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
          type: type !== null && type !== undefined ? type : undefined,
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
        isDeleted: false,
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
        isDeleted: false,
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
      const {
        name,
        userId,
        clinicId,
        gender,
        phone,
        email,
        isDisabled,
        emailVerified,
      } = query;
      const patients = await this.prismaService.patients.findMany({
        where: {
          userId: userId ? userId : undefined,
          clinicId: clinicId ? clinicId : undefined,
          deletedAt: null,
          patient: {
            gender:
              gender !== null && gender !== undefined ? gender : undefined,
            emailVerified:
              emailVerified !== null && emailVerified !== undefined
                ? emailVerified
                : undefined,
            phone: phone ? phone : undefined,
            email: email ? email : undefined,
            isDisabled:
              isDisabled !== null && isDisabled !== undefined
                ? isDisabled
                : undefined,
          },
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              gender: true,
              phone: true,
              birthday: true,
              address: true,
              emailVerified: true,
              isDisabled: true,
              avatar: true,
            },
          },
        },
      });
      const returnData = [];
      if (name) {
        for (const member of patients) {
          if (member.patient) {
            const strName =
              convertVietnameseString(member.patient.firstName) +
              ' ' +
              convertVietnameseString(member.patient.lastName);
            if (strName.includes(convertVietnameseString(name))) {
              returnData.push(member);
            }
          }
        }
      }
      return name ? returnData : patients;
    } catch (error) {
      console.log(error);
    }
  }

  async createPatient(data: Prisma.patientsUncheckedCreateInput) {
    return this.prismaService.patients.create({
      data,
    });
  }

  async findStaffById(id: number) {
    return this.prismaService.staffs.findUnique({
      where: {
        id,
      },
    });
  }

  async findPatientById(id: number) {
    return this.prismaService.patients.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async getPatientDetail(id: number) {
    return this.prismaService.patients.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            gender: true,
            phone: true,
            birthday: true,
            address: true,
            emailVerified: true,
            isDisabled: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updatePatient(id: number, data: Prisma.patientsUncheckedUpdateInput) {
    return this.prismaService.patients.update({
      where: {
        id,
      },
      data,
    });
  }
  async createPatientReception(
    data: Prisma.medicalRecordsUncheckedCreateInput,
  ) {
    return this.prismaService.medicalRecords.create({
      data,
      include: {
        patient: true,
        clinic: true,
        doctor: true,
      },
    });
  }

  async createMedicalRecordService(
    data: Prisma.medicalRecordServicesUncheckedCreateInput,
  ) {
    return this.prismaService.medicalRecordServices.create({
      data,
    });
  }

  async findMedicalRecordById(id: number) {
    const medicalRecords = await this.prismaService.medicalRecords.findUnique({
      where: {
        id,
      },
      include: {
        patient: {
          include: {
            patient: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                address: true,
                avatar: true,
                phone: true,
                gender: true,
                birthday: true,
              },
            },
          },
        },
        clinic: true,
        doctor: {
          include: {
            users: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                address: true,
                avatar: true,
                phone: true,
                gender: true,
                birthday: true,
              },
            },
          },
        },
        clinicRequestServices: true,
        medicalRecordServices: true,
        prescriptionDetail: true,
      },
    });
    if (!medicalRecords) {
      return null;
    }
    const { patient, doctor, ...rest }: any = medicalRecords;
    const { patient: patientInfo, ...restPatient }: any = patient;
    const { users: doctorInfo, ...restDoctor }: any = doctor;
    return {
      ...rest,
      patient: {
        ...restPatient,
        ...patientInfo,
      },
      doctor: {
        ...restDoctor,
        ...doctorInfo,
      },
    };
  }

  async updateMedicalRecord(
    id: number,
    data: Prisma.medicalRecordsUncheckedUpdateInput,
  ) {
    return this.prismaService.medicalRecords.update({
      where: {
        id,
      },
      data,
      include: {
        patient: true,
        clinic: true,
        doctor: true,
        clinicRequestServices: true,
        medicalRecordServices: true,
      },
    });
  }

  async deletePrecriptionByMedicalRecordId(medicalRecordId: number) {
    return this.prismaService.prescriptionDetail.deleteMany({
      where: {
        medicalRecordId,
      },
    });
  }

  async createPrescriptionDetail(
    data: Prisma.prescriptionDetailUncheckedCreateInput,
  ) {
    return this.prismaService.prescriptionDetail.create({
      data,
    });
  }

  async updateMedicalRecordService(
    id: number,
    data: Prisma.medicalRecordServicesUncheckedUpdateInput,
  ) {
    return this.prismaService.medicalRecordServices.update({
      where: {
        id,
      },
      data,
    });
  }

  async findMedicalRecords({
    clinicId,
    patientId,
    doctorId,
    paymentStatus,
  }: {
    clinicId?: string;
    patientId?: number;
    doctorId?: number;
    paymentStatus?: number;
  }) {
    const where: any = {
      ...(clinicId ? { clinicId } : {}),
      ...(patientId ? { patientId: +patientId } : {}),
      ...(doctorId ? { doctorId: +doctorId } : {}),
      ...(paymentStatus ? { paymentStatus: +paymentStatus } : {}),
    };
    const medicalRecords = await this.prismaService.medicalRecords.findMany({
      where,
      include: {
        patient: {
          include: {
            patient: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                address: true,
                avatar: true,
                phone: true,
                gender: true,
                birthday: true,
              },
            },
          },
        },
        clinic: true,
        doctor: {
          include: {
            users: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                address: true,
                avatar: true,
                phone: true,
                gender: true,
                birthday: true,
              },
            },
          },
        },
        clinicRequestServices: true,
        medicalRecordServices: true,
        prescriptionDetail: true,
      },
    });
    return map(medicalRecords, (medicalRecord) => {
      const { patient, doctor, ...rest }: any = medicalRecord;
      const { patient: patientInfo, ...restPatient }: any = patient;
      const { users: doctorInfo, ...restDoctor }: any = doctor;
      return {
        ...rest,
        patient: {
          ...restPatient,
          ...patientInfo,
        },
        doctor: {
          ...restDoctor,
          ...doctorInfo,
        },
      };
    });
  }

  async updateMedicalRecordServiceBySearch({
    medicalRecordId,
    clinicServiceId,
    data,
  }) {
    return this.prismaService.medicalRecordServices.updateMany({
      where: {
        medicalRecordId,
        clinicServiceId,
      },
      data,
    });
  }

  async findMedicalRecordService({
    medicalRecordId,
    clinicServiceId,
  }: {
    medicalRecordId: number;
    clinicServiceId: number;
  }) {
    return this.prismaService.medicalRecordServices.findFirst({
      where: {
        medicalRecordId,
        clinicServiceId,
      },
    });
  }

  async createClinicRequestService(
    data: Prisma.clinicRequestServicesUncheckedCreateInput,
  ) {
    return this.prismaService.clinicRequestServices.create({
      data,
    });
  }

  async findClinicRequestServiceByCode(code: string) {
    return this.prismaService.clinicRequestServices.findUnique({
      where: {
        code,
      },
    });
  }

  async updateClinicRequestService(
    code: string,
    data: Prisma.clinicRequestServicesUncheckedUpdateInput,
  ) {
    return this.prismaService.clinicRequestServices.update({
      where: {
        code,
      },
      data,
    });
  }

  async updateClinicStatistical({
    date,
    clinicId,
    payload,
  }: {
    date: Date | string;
    clinicId: string;
    payload: {
      revenue?: number;
      newPatient?: boolean;
      newAppointment?: boolean;
    };
  }) {
    return this.prismaService.clinicStatistic.upsert({
      where: {
        clinicId_date: {
          clinicId,
          date: moment(date).format('YYYY-MM-DD'),
        },
      },
      create: {
        clinicId,
        date: moment().format('YYYY-MM-DD'),
        ...(payload.newPatient && {
          numberOfPatients: 1,
        }),
        ...(payload.newAppointment && {
          numberOfAppointments: 1,
        }),
        ...(payload.revenue && {
          revenue: payload.revenue,
        }),
      },
      update: {
        ...(payload.revenue && {
          revenue: {
            increment: payload.revenue,
          },
        }),
        ...(payload.newPatient && {
          numberOfPatients: {
            increment: 1,
          },
        }),
        ...(payload.newAppointment && {
          numberOfAppointments: {
            increment: 1,
          },
        }),
      },
    });
  }

  async findClinicStatistical({
    clinicId,
    date,
    startDate,
    endDate,
  }: {
    clinicId: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.prismaService.clinicStatistic.findMany({
      where: {
        clinicId,
        ...(date
          ? {
              date,
            }
          : {
              date: moment(date).format('YYYY-MM-DD'),
            }),
        ...(startDate && endDate
          ? {
              date: {
                gte: moment(startDate).format('YYYY-MM-DD'),
                lte: moment(endDate).format('YYYY-MM-DD'),
              },
            }
          : {}),
      },
    });
  }

  async createInvestmentInvoice(
    data: Prisma.investmentInvoiceUncheckedCreateInput,
  ) {
    return this.prismaService.investmentInvoice.create({
      data,
    });
  }

  async findInvestmentInvoiceByMedicalRecordId(medicalRecordId: number) {
    return this.prismaService.investmentInvoice.findUnique({
      where: {
        medicalRecordId,
      },
      include: {
        invoiceDetail: true,
        clinic: true,
        patient: true,
        medicalRecord: true,
      },
    });
  }
  async createInvoiceDetail(data: Prisma.invoiceDetailUncheckedCreateInput) {
    return this.prismaService.invoiceDetail.create({
      data,
    });
  }

  async findInvoiceDetailByInvoiceId(invoiceId: number) {
    return this.prismaService.invoiceDetail.findMany({
      where: {
        invoiceId,
      },
    });
  }

  async findInvestmentInvoiceById(id: number) {
    return this.prismaService.investmentInvoice.findUnique({
      where: {
        id,
      },
      include: {
        invoiceDetail: true,
        clinic: true,
        patient: true,
        medicalRecord: true,
      },
    });
  }
}
