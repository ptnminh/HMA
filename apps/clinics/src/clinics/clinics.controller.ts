import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { ClinicService } from './clinics.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import {
  AuthCommand,
  ClinicCommand,
  ClinicStatiticsCommand,
  MedicalSupplierCommand,
  PatientCommand,
  PatientReceptionCommand,
} from './command';
import { Prisma } from '@prisma/client';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import * as moment from 'moment-timezone';
import { BookingStatus, EVENTS, SUBSCRIPTION_STATUS } from 'src/shared';
import { filter, map, sumBy, uniq } from 'lodash';
import {
  calculateTimeBefore,
  combineDateAndTime,
  isContainSpecialChar,
  scheduleJob,
} from './utils';
import { customAlphabet } from 'nanoid';
import { ICreatePatientReception } from './interface';

@Controller()
export class ClinicController {
  constructor(
    private readonly clinicService: ClinicService,
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
    @Inject('NOTI_SERVICE')
    private readonly notiServiceClient: ClientProxy,
  ) {}
  @MessagePattern(ClinicCommand.CLINIC_CREATE)
  async createClinic(data: any) {
    try {
      const { planId, ...preparePayload } = data;
      const clinic = await this.clinicService.create(preparePayload);

      const plan = await this.clinicService.getPlanDetail(+planId);
      if (!plan) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Plan không tồn tại',
        };
      }
      const { duration } = plan;

      // create clinic group roles
      const payloadClinicGroupRoles: Prisma.clinicGroupRolesUncheckedCreateInput =
        {
          clinicId: clinic.id,
          name: 'Admin',
          description: 'Owner who can manage clinic',
        };
      const clinicGroupRole = await this.clinicService.createClinicGroupRoles(
        payloadClinicGroupRoles,
      );
      if (!clinicGroupRole) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tạo clinic group role thất bại',
        };
      }

      const permissions = await this.clinicService.getPermissions();
      if (!permissions || permissions.length === 0) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Không tìm thấy permissions',
        };
      }
      // create role permissions
      await Promise.all(
        permissions.map(async (permission) =>
          this.clinicService.createRolePermissions({
            roleId: clinicGroupRole.id,
            permissionId: permission.id,
          }),
        ),
      );
      // add user to clinic
      const payload: Prisma.staffsUncheckedCreateInput = {
        userId: data.ownerId,
        clinicId: clinic.id,
        roleId: clinicGroupRole.id,
      };
      await this.clinicService.addUserToClinic(payload);

      // subscribe plan
      const payloadSubcribePlan: Prisma.subscriptionsUncheckedCreateInput = {
        planId: +planId,
        clinicId: clinic.id,
        expiredAt: moment().add(duration, 'days').toISOString(),
        status: SUBSCRIPTION_STATUS.INPAYMENT,
        subcribedAt: new Date().toISOString(),
      };
      const subscription =
        await this.clinicService.subcribePlan(payloadSubcribePlan);

      // update role for user
      await firstValueFrom(
        this.authServiceClient.send(ClinicCommand.UPDATE_USER, {
          id: data.ownerId,
          moduleId: 2,
        }),
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo clinic thành công',
        data: { clinic, subscription },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.CLINIC_LIST)
  async listClinic(data: any) {
    try {
      const { userId, query } = data;
      const clinics = await this.clinicService.findAll(userId, query);
      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách clinic thành công',
        data: clinics,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.UPDATE_CLINIC)
  async updateClinic(data: any) {
    try {
      const { id, ...payload } = data;
      const clinic = await this.clinicService.update(id, payload);
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật clinic thành công',
        data: clinic,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.ADD_USER_TO_CLINIC)
  async addUserToClinic(data: any) {
    try {
      const { clinicId, userId, roleId } = data;
      const findUserInClinic = await this.clinicService.findUserInClinic(
        clinicId,
        userId,
      );
      if (findUserInClinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'User đã tồn tại trong clinic',
        };
      }
      const payload: Prisma.staffsUncheckedCreateInput = {
        userId,
        clinicId,
        roleId: roleId || 4,
      };
      await this.clinicService.addUserToClinic(payload);
      // update role for user
      await firstValueFrom(
        this.authServiceClient.send(ClinicCommand.UPDATE_USER, {
          id: userId,
          moduleId: 2,
        }),
      );
      const usersInClinic = await this.clinicService.findAllUserInClinic(
        data.clinicId,
      );
      return {
        status: HttpStatus.OK,
        message: 'Thêm user vào clinic thành công',
        data: usersInClinic.map((user) => {
          const { users, ...rest } = user;
          return {
            ...rest,
            ...(users || {}),
          };
        }),
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.SUBSCRIBE_PLAN)
  async subscribePlan(data: any) {
    try {
      const { clinicId, planId, expiredAt, status } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const payload: Prisma.subscriptionsUncheckedCreateInput = {
        planId,
        clinicId,
        expiredAt,
        status,
      };
      const subscription = await this.clinicService.subcribePlan(payload);
      return {
        status: HttpStatus.OK,
        message: 'Subscribe plan thành công',
        data: subscription,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.UPDATE_SUBSCRIBE_PLAN)
  async updateSubscribePlan(data: any) {
    try {
      const { clinicId, subscribePlanId, data: payload } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const subscription = await this.clinicService.updateSubscribePlan(
        subscribePlanId,
        payload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Update subscribe plan thành công',
        data: subscription,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.GET_USERS_BY_CLINIC)
  async getUsersByClinic(data: any) {
    try {
      const { clinicId } = data;
      const usersInClinic =
        await this.clinicService.findAllUserInClinic(clinicId);
      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách user thành công',
        data: usersInClinic?.map((user) => {
          const { users, ...rest } = user;
          return {
            ...rest,
            ...users,
          };
        }),
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.GET_PERMISSIONS)
  async getPermissions() {
    try {
      const permissions = await this.clinicService.getPermissions();
      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách permissions thành công',
        data: permissions,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.GET_SUBSCRIBE_PLAN)
  async getSubscription(data: any) {
    try {
      const { subscribePlanId } = data;
      const subscriptions =
        await this.clinicService.getSubscription(subscribePlanId);
      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách subscriptions thành công',
        data: subscriptions,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(ClinicCommand.CREATE_USER_GROUP_ROLE)
  async createUserGroupRole(data: any) {
    try {
      const { clinicId, data: payload } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const { name, description, permissions } = payload;
      const preparePayload: Prisma.clinicGroupRolesUncheckedCreateInput = {
        clinicId,
        name,
        description,
      };
      const clinicGroupRole =
        await this.clinicService.createClinicGroupRoles(preparePayload);
      if (!clinicGroupRole) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tạo clinic group role thất bại',
        };
      }
      // create role permissions
      await Promise.all(
        permissions.map(async (permission: number) =>
          this.clinicService.createRolePermissions({
            roleId: clinicGroupRole.id,
            permissionId: permission,
          }),
        ),
      );
      return {
        status: HttpStatus.OK,
        message: 'Tạo clinic group role thành công',
        data: clinicGroupRole,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.DELETE_USER_GROUP_ROLE)
  async deleteUserGroupRole(data: any) {
    try {
      const { clinicId, userGroupRoleId, userId } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const { ownerId } = clinic;
      if (userId !== ownerId) {
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Bạn không có quyền xóa role này',
        };
      }
      const userGroupRole =
        await this.clinicService.findClinicGroupRoleById(userGroupRoleId);
      if (!userGroupRole) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'User group role không tồn tại',
        };
      }
      const { staffs } = userGroupRole;
      if (staffs && staffs.length > 0) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Không thể xóa role này',
        };
      }
      await this.clinicService.updateClinicGroupRole({
        where: {
          id: userGroupRoleId,
        },
        data: {
          isDisabled: true,
        },
      });
      return {
        status: HttpStatus.OK,
        message: 'Xóa clinic group role thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.UPDATE_USER_GROUP_ROLE)
  async updateUserGroupRole(data: any) {
    try {
      const { clinicId, userGroupRoleId, data: payload } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const userGroupRole =
        await this.clinicService.findClinicGroupRoleById(userGroupRoleId);
      if (!userGroupRole) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'User group role không tồn tại',
        };
      }
      const { name, description, permissions } = payload;
      if (permissions && permissions.length > 0) {
        // delete all role permissions
        await this.clinicService.deleteAllRolePermissions(userGroupRoleId);
        // create role permissions
        await Promise.all(
          permissions.map(async (permission: number) =>
            this.clinicService.createRolePermissions({
              roleId: userGroupRoleId,
              permissionId: permission,
            }),
          ),
        );
      }
      const updatedUserGroupRole =
        await this.clinicService.updateClinicGroupRole({
          where: {
            id: userGroupRoleId,
          },
          data: {
            name,
            description,
          },
        });
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật clinic group role thành công',
        data: {
          ...updatedUserGroupRole,
          ...payload,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.GET_USER_GROUP_ROLE)
  async getUserGroupRole(data: any) {
    try {
      const { clinicId } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const userGroupRole =
        await this.clinicService.findClinicGroupRoleByClinicId(clinicId);
      if (!userGroupRole || userGroupRole.length === 0) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'User group role không tồn tại',
        };
      }

      return {
        status: HttpStatus.OK,
        message: 'Lấy user group role thành công',
        data: userGroupRole?.map((group) => ({
          ...group,
          rolePermissions: map(group.rolePermissions, 'permission'),
        })),
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.GET_CLINIC_DETAIL)
  async getClinicDetail(data: any) {
    try {
      const { clinicId } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const { subscriptions, staffs, ownerId, ...rest } = clinic;
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin clinic thành công',
        data: {
          ...rest,
          subscriptions: subscriptions?.map((subscription) => ({
            ...subscription,
            plans: subscription.plans,
          })),
          staffs: staffs?.map((user) => {
            return {
              role: user.role.name,
              isOwner: user.userId === ownerId,
            };
          }),
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(ClinicCommand.CREATE_CLINIC_SERVICE)
  async createClinicService(data: any) {
    try {
      const { clinicId, categoryId, ...payload } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      if (categoryId) {
        const category = await this.clinicService.findCategoryById(categoryId);
        if (!category) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Category không tồn tại',
          };
        }
      }
      const preparedPayload: Prisma.clinicServicesUncheckedCreateInput = {
        clinicId,
        categoryId,
        ...payload,
      };
      const clinicService =
        await this.clinicService.createClinicService(preparedPayload);
      if (!clinicService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tạo clinic service thất bại',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Tạo clinic service thành công',
        data: clinicService,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(ClinicCommand.GET_APPOINMENTS)
  async getAppointments(data: any) {
    try {
      const { clinicId, date, status, doctorId } = data;
      const appointments = await this.clinicService.getAppointments({
        date,
        status,
        doctorId: +doctorId,
        clinicId,
      });
      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách appointments thành công',
        data: appointments,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(ClinicCommand.UPDATE_APPOINMENT)
  async updateAppointment(data: any) {
    try {
      const { appointmentId, ...payload } = data;
      const appointment =
        await this.clinicService.findAppointmentById(appointmentId);
      if (!appointment) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Appointment không tồn tại',
        };
      }
      const updatedAppointment = await this.clinicService.updateAppointment(
        appointmentId,
        payload,
      );
      const patientInfo = await this.clinicService.findPatientById(
        data.patientId,
      );
      const doctorInfo = await this.clinicService.findStaffById(data.doctorId);
      if (!doctorInfo) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Bác sĩ không tồn tại',
        };
      }
      if (!patientInfo) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Bệnh nhân không tồn tại',
        };
      }
      const getTokensOfPatient = await firstValueFrom(
        this.authServiceClient.send(AuthCommand.GET_USER_TOKEN, {
          userId: patientInfo.userId,
        }),
      );
      if (getTokensOfPatient.status !== HttpStatus.OK) {
        return {
          message: 'Không tím thấy tokens của bệnh nhân.',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      const patientTokens = getTokensOfPatient.data?.map((item) => item.token);
      const getTokensOfDoctor = await firstValueFrom(
        this.authServiceClient.send(AuthCommand.GET_USER_TOKEN, {
          userId: doctorInfo.userId,
        }),
      );
      if (getTokensOfDoctor.status !== HttpStatus.OK) {
        return {
          message: 'Không tím thấy tokens của bác sĩ.',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      const doctorTokens = getTokensOfDoctor.data?.map((item) => item.token);
      if (data.status) {
        await lastValueFrom(
          this.notiServiceClient.emit(EVENTS.NOTIFICATION_PUSH, {
            tokens: patientTokens,
            body: `Lịch hẹn khám ngày ${moment(data.date).format('DD-MM-YYYY')} lúc ${data.startTime} đã được ${data.status === BookingStatus.CONFIRM ? 'xác nhận' : 'hủy'}`,
            title: 'Thông báo',
          }),
        );
        await lastValueFrom(
          this.notiServiceClient.emit(EVENTS.NOTIFICATION_PUSH, {
            tokens: doctorTokens,
            body: `Bạn có một lịch hẹn khám lúc ${data.startTime} ngày ${moment(data.date).format('DD-MM-YYYY')} đã được ${data.status === BookingStatus.CONFIRM ? 'xác nhận' : 'hủy'}`,
            title: 'Thông báo',
          }),
        );

        await lastValueFrom(
          this.notiServiceClient.emit(EVENTS.NOTIFICATION_CREATE, {
            userId: patientInfo.userId,
            content: `Lịch hẹn khám ngày ${moment(data.date).format('DD-MM-YYYY')} lúc ${data.startTime} đã được ${data.status === BookingStatus.CONFIRM ? 'xác nhận' : 'hủy'}`,
            title: 'Thông báo',
          }),
        );
        await lastValueFrom(
          this.notiServiceClient.emit(EVENTS.NOTIFICATION_CREATE, {
            userId: doctorInfo.userId,
            content: `Bạn có một lịch hẹn khám lúc ${data.startTime} ngày ${moment(data.date).format('DD-MM-YYYY')} đã được ${data.status === BookingStatus.CONFIRM ? 'xác nhận' : 'hủy'}`,
            title: 'Thông báo',
          }),
        );
      }
      if (data.status === BookingStatus.CONFIRM) {
        const startTime = appointment.startTime;
        const dateAppointment = appointment.date;
        const thirtyMinutesBefore = calculateTimeBefore(startTime, 30);
        const time = combineDateAndTime(dateAppointment, thirtyMinutesBefore);
        scheduleJob(time, async () => {
          await lastValueFrom(
            this.notiServiceClient.emit(EVENTS.NOTIFICATION_PUSH, {
              tokens: patientTokens,
              body: `Lịch hẹn khám ngày ${moment(data.date).format('DD-MM-YYYY')} lúc ${data.startTime} còn 30 phút nữa trước khi bắt đầu`,
              title: 'Thông báo',
            }),
          );
        });
      }
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật appointment thành công',
        data: updatedAppointment,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(ClinicCommand.GET_APPOINMENT_BY_ID)
  async getAppointmentById(data: any) {
    try {
      const { appointmentId } = data;
      const appointment =
        await this.clinicService.findAppointmentById(appointmentId);
      if (!appointment) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Appointment không tồn tại',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin appointment thành công',
        data: appointment,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(ClinicCommand.CREATE_APPOINMENT)
  async createAppointment(data: {
    clinicId: string;
    doctorId: number;
    patientId?: number;
    userId?: string;
    startTime: string;
    endTime?: string;
    date: string;
    serviceId?: number;
    status?: string;
  }) {
    try {
      if (!data.patientId) {
        const patient = await this.clinicService.createPatient({
          clinicId: data.clinicId,
          userId: data.userId,
        });
        if (!patient) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Tạo patient thất bại',
          };
        }
        data.patientId = patient.id;
      }
      const patientInfo = await this.clinicService.findPatientById(
        data.patientId,
      );
      const doctorInfo = await this.clinicService.findStaffById(data.doctorId);
      if (!doctorInfo) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Bác sĩ không tồn tại',
        };
      }
      if (!patientInfo) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Bệnh nhân không tồn tại',
        };
      }
      const appointment = await this.clinicService.createAppointment({
        ...data,
        status: data?.status || BookingStatus.PENDING,
      });
      if (!appointment) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Appointment không tồn tại',
        };
      }
      if (!data?.status) {
        const members = await this.clinicService.findUsersInClinic(
          data.clinicId,
        );
        await Promise.all(
          map(members, async (member) => {
            try {
              if (
                filter(
                  member.role.rolePermissions,
                  (rolePermission) =>
                    rolePermission.permission.optionName ===
                    'Quản lý thăm khám bệnh nhân',
                ).length > 0
              ) {
                const getTokens = await firstValueFrom(
                  this.authServiceClient.send(AuthCommand.GET_USER_TOKEN, {
                    userId: member.userId,
                  }),
                );
                if (getTokens.status !== HttpStatus.OK) {
                  return {
                    message: getTokens.message,
                    status: HttpStatus.BAD_REQUEST,
                  };
                }
                const tokens = getTokens.data?.map((item) => item.token);
                await lastValueFrom(
                  this.notiServiceClient.emit(EVENTS.NOTIFICATION_PUSH, {
                    tokens,
                    body: 'Lịch hẹn mới đang chờ xác nhận',
                    title: 'Thông báo',
                  }),
                );
                await lastValueFrom(
                  this.notiServiceClient.emit(EVENTS.NOTIFICATION_CREATE, {
                    userId: member.userId,
                    content: `Lịch hẹn mới đang chờ xác nhận`,
                    title: 'Thông báo',
                  }),
                );
              }
              return member;
            } catch (error) {
              console.log(error);
            }
          }),
        );
      }
      if (data.status === BookingStatus.CONFIRM) {
        const getTokensOfPatient = await firstValueFrom(
          this.authServiceClient.send(AuthCommand.GET_USER_TOKEN, {
            userId: patientInfo.userId,
          }),
        );
        if (getTokensOfPatient.status !== HttpStatus.OK) {
          return {
            message: 'Không tím thấy tokens của bệnh nhân.',
            status: HttpStatus.BAD_REQUEST,
          };
        }
        const patientTokens = getTokensOfPatient.data?.map(
          (item) => item.token,
        );
        const getTokensOfDoctor = await firstValueFrom(
          this.authServiceClient.send(AuthCommand.GET_USER_TOKEN, {
            userId: doctorInfo.userId,
          }),
        );
        if (getTokensOfDoctor.status !== HttpStatus.OK) {
          return {
            message: 'Không tím thấy tokens của bác sĩ.',
            status: HttpStatus.BAD_REQUEST,
          };
        }
        const doctorTokens = getTokensOfDoctor.data?.map((item) => item.token);
        await lastValueFrom(
          this.notiServiceClient.emit(EVENTS.NOTIFICATION_PUSH, {
            tokens: patientTokens,
            body: `Lịch hẹn khám ngày ${moment(data.date).format('DD-MM-YYYY')} lúc ${data.startTime} đã được xác nhận`,
            title: 'Thông báo',
          }),
        );
        await lastValueFrom(
          this.notiServiceClient.emit(EVENTS.NOTIFICATION_PUSH, {
            tokens: doctorTokens,
            body: `Bạn có một lịch hẹn khám lúc ${data.startTime} ngày ${moment(data.date).format('DD-MM-YYYY')}`,
            title: 'Thông báo',
          }),
        );
        await lastValueFrom(
          this.notiServiceClient.emit(EVENTS.NOTIFICATION_CREATE, {
            userId: patientInfo.userId,
            content: `Lịch hẹn khám ngày ${moment(data.date).format('DD-MM-YYYY')} lúc ${data.startTime} đã được ${data.status === BookingStatus.CONFIRM ? 'xác nhận' : 'hủy'}`,
            title: 'Thông báo',
          }),
        );
        await lastValueFrom(
          this.notiServiceClient.emit(EVENTS.NOTIFICATION_CREATE, {
            userId: doctorInfo.userId,
            content: `Bạn có một lịch hẹn khám lúc ${data.startTime} ngày ${moment(data.date).format('DD-MM-YYYY')} đã được ${data.status === BookingStatus.CONFIRM ? 'xác nhận' : 'hủy'}`,
            title: 'Thông báo',
          }),
        );
      }
      await this.clinicService
        .updateClinicStatistical({
          date: moment().format('YYYY-MM-DD'),
          clinicId: data.clinicId,
          payload: {
            newAppointment: true,
          },
        })
        .catch((error) => {
          console.log(error);
        });
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin appointment thành công',
        data: appointment,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(ClinicCommand.GET_CLINIC_SERVICE_BY_ID)
  async findClinicServiceById(data: any) {
    try {
      const { id } = data;
      const clinicService = await this.clinicService.findClinicServiceById(id);
      if (!clinicService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic service không tồn tại',
        };
      }
      const { category, staffServices, ...rest } = clinicService;
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin clinic service thành công',
        data: {
          ...rest,
          staffIds: uniq(map(staffServices, 'staffId')),
          categoryName: category ? category.name : null,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.GET_CLINIC_SERVICE_BY_CLINIC_ID)
  async findClinicServiceByClinicId(data: any) {
    try {
      const { clinicId, isDisabled } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const clinicServices =
        await this.clinicService.findClinicServiceByClinicId(
          clinicId,
          isDisabled,
        );
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin clinic service thành công',
        data: clinicServices.map((service) => {
          const { category, staffServices, ...rest } = service;
          return {
            ...rest,
            staffIds: uniq(map(staffServices, 'staffId')),
            categoryName: category ? category.name : null,
          };
        }),
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.UPDATE_CLINIC_SERVICE)
  async updateClinicService(data: any) {
    try {
      const { id, categoryId, ...payload } = data;
      const clinicService = await this.clinicService.findClinicServiceById(id);
      if (!clinicService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic service không tồn tại',
        };
      }
      const category = await this.clinicService.findCategoryById(categoryId);
      if (categoryId && !category) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Category không tồn tại',
        };
      }
      const preparedPayload: Prisma.clinicServicesUncheckedUpdateInput = {
        id,
        categoryId: categoryId ? categoryId : null,
        ...payload,
      };
      const updatedClinicServices =
        await this.clinicService.updateClinicService(id, preparedPayload);
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật clinic service thành công',
        data: updatedClinicServices,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.DELETE_CLINIC_SERVICE)
  async deleteClinicService(data: any) {
    try {
      const { id } = data;
      const clinicService = await this.clinicService.findClinicServiceById(id);
      if (!clinicService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic service không tồn tại',
        };
      }
      await this.clinicService.deleteClinicService(id);
      return {
        status: HttpStatus.OK,
        message: 'Xóa clinic service thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.FIND_ALL_STAFF_IN_CLINIC)
  async getAllStaffInClinic(data: any) {
    try {
      const { clinicId } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic service không tồn tại',
        };
      }
      const staffs = await this.clinicService.findAllStaffInClinic(clinicId);
      return {
        data: staffs,
        status: HttpStatus.OK,
        message: 'Lấy danh sách staff trong clinic thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.CREATE_CATEGORY)
  async createCategory(data: any) {
    try {
      const { clinicId, ...rest } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const payload: Prisma.categoryUncheckedCreateInput = {
        clinicId,
        ...rest,
      };

      const category = await this.clinicService.createCategory(payload);
      if (!category) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tạo categoty thất bại',
        };
      }
      return {
        data: category,
        status: HttpStatus.CREATED,
        message: 'Tạo category thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.FIND_CATEGORY_BY_ID)
  async findCategoryById(data: any) {
    try {
      const { id } = data;
      const category = await this.clinicService.findCategoryById(id);
      if (!category) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tìm kíếm thất bại',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Tìm kiếm thành công',
        data: category,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.UPDATE_CATEGORY)
  async updateCategoty(data: any) {
    try {
      const { id, ...rest } = data;
      const category = await this.clinicService.findCategoryById(id);
      if (!category) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Category không tồn tại',
        };
      }
      const updatePayload: Prisma.categoryUncheckedUpdateInput = {
        ...rest,
      };
      const updatedCategory = await this.clinicService.updateCategory(
        updatePayload,
        id,
      );
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật category thành công',
        data: updatedCategory,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.SEARCH_CATEGORY)
  async searchCategory(data: any) {
    try {
      const { clinicId, name, type } = data;
      if (name && isContainSpecialChar(name)) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tên phân loại không hợp lệ',
        };
      }
      const categories = await this.clinicService.searchCategory(
        clinicId,
        name,
        type,
      );
      return {
        status: HttpStatus.OK,
        message: 'Tìm kiếm thành công',
        data: categories,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.DELETE_CATEGORY)
  async deleteCategory(data: any) {
    try {
      const { id } = data;
      const category = await this.clinicService.findCategoryById(id);
      if (!category) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Category không tồn tại',
        };
      }
      await this.clinicService.deleteCategory(id);
      const deletedCategory = await this.clinicService.findCategoryById(id);
      if (deletedCategory) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Xóa Category thất bại',
        };
      }
      await this.clinicService.updateClinicServiceByCategoryId(category.id, {
        categoryId: null,
      });
      await this.clinicService.updateMedicalSuppliersByCategoryId(category.id, {
        categoryId: null,
      });
      return {
        status: HttpStatus.OK,
        message: 'Xóa Category thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.CREATE_NEWS)
  async createNews(data: any) {
    try {
      const { clinicId, ...rest } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const payload: Prisma.clinicNewsUncheckedCreateInput = {
        clinicId,
        ...rest,
      };
      const news = await this.clinicService.createNews(payload);
      if (!news) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tạo tin tức thất bại',
        };
      }
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo tin tức thành công',
        data: news,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.FIND_NEWS_BY_ID)
  async getNewsById(data: any) {
    try {
      const { id } = data;
      const news = await this.clinicService.findNewsById(id);
      if (!news) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tin tức không tồn tại',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Tìm kiếm tin tức thành công',
        data: news,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.UPDATE_NEWS)
  async updateNews(data: any) {
    try {
      const { id, ...rest } = data;
      const news = await this.clinicService.findNewsById(id);
      if (!news) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tin tức không tồn tại',
        };
      }
      const updatedNews = await this.clinicService.updateNews(id, rest);
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật tin tức thành công',
        data: updatedNews,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.DELETE_NEWS)
  async deleteNews(data: any) {
    try {
      const { id } = data;
      const news = await this.clinicService.findNewsById(id);
      if (!news) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tin tức không tồn tại',
        };
      }
      await this.clinicService.deleteNews(id);
      const deletedNews = await this.clinicService.findNewsById(id);
      if (deletedNews) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Xóa tin tức thất bại',
        };
      }
      return {
        data: null,
        status: HttpStatus.OK,
        message: 'Xóa tin tức thành công',
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.SEARCH_NEWS)
  async searchNews(data: any) {
    try {
      const { clinicId, title, isShow, page, size } = data;
      if (title && isContainSpecialChar(title)) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tên phân loại không hợp lệ',
        };
      }
      const news = await this.clinicService.searchNews(clinicId, title, isShow);
      const total = news.length;

      const result = [];
      const minIndex = page * size;
      const maxIndex = (page + 1) * size < total ? (page + 1) * size : total;
      for (let i = minIndex; i < maxIndex; i++) {
        result.push(news[i]);
      }

      return {
        status: HttpStatus.OK,
        message: 'Tìm kiếm thành công',
        data: {
          data: result.map((news) => {
            const { clinics, ...rest } = news;
            return {
              ...rest,
              clinicName: clinics ? clinics.name : null,
            };
          }),
          pageSize: size,
          currentPage: page + 1,
          total,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(MedicalSupplierCommand.MEDICAL_SUPPLIER_CREATE)
  async createMedicalSupplier(data: any) {
    try {
      const { expiredAt, expiry, ...rest } = data;
      const exSupplier = await this.clinicService.findMedicalSupplyByName(
        rest.medicineName,
      );
      if (exSupplier) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Medicine đã tồn tại',
        };
      }
      const payload: Prisma.medicalSuppliesUncheckedCreateInput = {
        ...rest,
        ...(expiredAt && { expiredAt: new Date(expiredAt).toISOString() }),
        ...(expiry && { expiredAt: new Date(expiry).toISOString() }),
      };
      const medicalSupplier =
        await this.clinicService.createMedicalSupplier(payload);
      if (!medicalSupplier) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tạo nhà cung cấp thất bại',
        };
      }
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo nhà cung cấp thành công',
        data: medicalSupplier,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(MedicalSupplierCommand.MEDICAL_SUPPLIER_LIST)
  async listMedicalSupplier(data: any) {
    try {
      const { vendor, medicineName, isDisabled, clinicId } = data;
      const medicalSuppliers = await this.clinicService.listMedicalSupplier({
        vendor,
        clinicId,
        medicineName,
        isDisabled,
      });

      return {
        status: HttpStatus.OK,
        message: 'Tìm kiếm thành công',
        data: medicalSuppliers?.map((supplier) => {
          const { category, ...rest } = supplier;
          return {
            ...rest,
            categoryName: category ? category.name : null,
          };
        }),
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(MedicalSupplierCommand.MEDICAL_SUPPLIER_UPDATE)
  async updateMedicalSupplier(data: any) {
    try {
      const { id, expiredAt, expiry, ...rest } = data;
      const medicalSupplier =
        await this.clinicService.findMedicalSupplierById(id);
      if (!medicalSupplier) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Nhà cung cấp không tồn tại',
        };
      }
      const payload: Prisma.medicalSuppliesUncheckedUpdateInput = {
        ...rest,
        ...(expiredAt && { expiredAt: new Date(expiredAt).toISOString() }),
        ...(expiry && { expiredAt: new Date(expiry).toISOString() }),
      };
      const updatedMedicalSupplier =
        await this.clinicService.updateMedicalSupplier(id, payload);
      const categoryName = updatedMedicalSupplier?.category?.name;
      delete updatedMedicalSupplier?.category;
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật nhà cung cấp thành công',
        data: {
          ...updatedMedicalSupplier,
          categoryName,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(MedicalSupplierCommand.MEDICAL_SUPPLIER_GET)
  async getMedicalSupplier(data: any) {
    try {
      const { id } = data;
      const medicalSupplier =
        await this.clinicService.findMedicalSupplierById(id);
      if (!medicalSupplier) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Nhà cung cấp không tồn tại',
        };
      }
      const categoryName = medicalSupplier?.category?.name;
      delete medicalSupplier?.category;
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin nhà cung cấp thành công',
        data: {
          ...medicalSupplier,
          categoryName,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(PatientCommand.SEARCH_PATIENT)
  async searchPatient(query: any) {
    try {
      // const isEmpty = Object.values(query).every(
      //   (value) => value === null || value === '',
      // );
      // if (isEmpty) {
      //   return {
      //     message: 'Không có dữ liệu tìm kiếm',
      //     status: HttpStatus.BAD_REQUEST,
      //   };
      // }

      const patients = await this.clinicService.searchPatient(query);
      return {
        status: HttpStatus.OK,
        message: 'Tìm kiếm thành công',
        data: patients.map((value) => {
          const { patient, ...rest } = value;
          return {
            ...rest,
            ...patient,
          };
        }),
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientCommand.CREATE_PATIENT)
  async createPatient(data: any) {
    try {
      const { userInfo, clinicId, ...rest } = data;
      let userId = data.userId;
      let uniqueId: string = '';
      if (!userId) {
        const randomPassword = Math.random().toString(36).slice(-8);
        uniqueId = randomPassword;
        const userPayload: Prisma.usersUncheckedCreateInput = {
          email: userInfo.email,
          firstName: userInfo?.firstName,
          lastName: userInfo?.lastName,
          phone: userInfo?.phone,
          password: randomPassword,
          avatar: userInfo?.avatar,
          isInputPassword: false,
          gender: userInfo?.gender,
          address: userInfo?.address,
          moduleId: 3,
          emailVerified: false,
          ...(userInfo.birthday && {
            birthday: new Date(userInfo.birthday).toISOString(),
          }),
        };
        const createUserResponse = await firstValueFrom(
          this.authServiceClient.send(AuthCommand.USER_CREATE, {
            ...userPayload,
            type: 'CREATE_PATIENT',
            rawPassword: randomPassword,
            uniqueId,
          }),
        );
        if (createUserResponse.status !== HttpStatus.CREATED) {
          return {
            message: createUserResponse.message,
            status: HttpStatus.BAD_REQUEST,
          };
        }
        userId = createUserResponse?.user?.id;
      }
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const patientPayload: Prisma.patientsUncheckedCreateInput = {
        userId,
        clinicId,
        ...rest,
      };
      await this.clinicService
        .updateClinicStatistical({
          date: moment().format('YYYY-MM-DD'),
          clinicId,
          payload: {
            newPatient: true,
          },
        })
        .catch((error) => {
          console.log(error);
        });
      const patient = await this.clinicService.createPatient(patientPayload);
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo bệnh nhân thành công',
        data: patient,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientCommand.GET_PATIENT_BY_ID)
  async findPatientById(data: any) {
    const { id } = data;
    const patientInfo = await this.clinicService.getPatientDetail(id);
    if (!patientInfo) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Bệnh nhân không tồn tại',
      };
    }
    const { patient, ...rest } = patientInfo;
    return {
      status: HttpStatus.OK,
      data: {
        ...rest,
        ...patient,
      },
      message: 'Tìm kiếm thành công',
    };
  }

  @MessagePattern(PatientCommand.UPDATE_PATIENT)
  async updatePatient(data: any) {
    const { id, payload } = data;
    const patientInfo = await this.clinicService.findPatientById(id);
    if (!patientInfo) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Bệnh nhân không tồn tại',
      };
    }
    const updatedData: Prisma.patientsUncheckedUpdateInput = {
      ...payload,
    };
    const updatedPatient = await this.clinicService.updatePatient(
      id,
      updatedData,
    );
    return {
      status: HttpStatus.OK,
      data: updatedPatient,
      message: 'Cập nhật thành công',
    };
  }

  @MessagePattern(PatientCommand.DELETE_PATIENT)
  async deletePatient(data: any) {
    const { id } = data;
    const patientInfo = await this.clinicService.findPatientById(id);
    if (!patientInfo) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Bệnh nhân không tồn tại',
      };
    }
    const updatedData: Prisma.patientsUncheckedUpdateInput = {
      deletedAt: new Date(Date.now()),
    };
    await this.clinicService.updatePatient(id, updatedData);
    return {
      status: HttpStatus.OK,
      data: null,
      message: 'Xóa bệnh nhân thành công',
    };
  }
  @MessagePattern(PatientReceptionCommand.CREATE_PATIENT_RECEPTION)
  async createPatientReception(data: { appointmentId: number }) {
    try {
      const { appointmentId } = data;

      const appointment =
        await this.clinicService.findAppointmentById(appointmentId);
      if (!appointment) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Appointment không tồn tại',
        };
      }
      const {
        date: dateCreated,
        serviceId,
        clinicId,
        patientId,
        doctorId,
      } = appointment;

      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const patient = await this.clinicService.findPatientById(patientId);
      if (!patient) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Bệnh nhân không tồn tại',
        };
      }

      const serviceDetail =
        await this.clinicService.findClinicServiceById(serviceId);

      const payload: Prisma.medicalRecordsUncheckedCreateInput = {
        patientId,
        doctorId,
        clinicId,
        examinationStatus: 0,
        paymentStatus: 0,
        ...(dateCreated && {
          dateCreated: new Date(dateCreated).toISOString(),
        }),
      };
      const patientReception =
        await this.clinicService.createPatientReception(payload);
      if (!patientReception) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tạo phiếu tiếp nhận bệnh nhân thất bại',
        };
      }
      const medicalRecordServicePayload: Prisma.medicalRecordServicesUncheckedCreateInput =
        {
          medicalRecordId: patientReception.id,
          amount: serviceDetail.price,
          clinicId,
          clinicServiceId: serviceId,
          serviceName: serviceDetail.serviceName,
          doctorId,
        };
      await this.clinicService.createMedicalRecordService(
        medicalRecordServicePayload,
      );
      await this.clinicService.updateAppointment(appointmentId, {
        status: BookingStatus.CHECK_IN,
      });
      const medicalRecord = await this.clinicService.findMedicalRecordById(
        patientReception.id,
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo phiếu tiếp nhận bệnh nhân thành công',
        data: medicalRecord,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.UPDATE_PATIENT_RECEPTION)
  async updatePatientReception(data: any) {
    try {
      const { id, ...rest } = data;
      const patientReception =
        await this.clinicService.findMedicalRecordById(id);
      if (!patientReception) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Phiếu tiếp nhận không tồn tại',
        };
      }

      await this.clinicService.updateMedicalRecord(id, rest);
      const medicalRecord = await this.clinicService.findMedicalRecordById(id);
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật phiếu tiếp nhận thành công',
        data: medicalRecord,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.GET_MEDICAL_RECORD)
  async getMedicalRecord(data: any) {
    try {
      const { id } = data;
      const medicalRecord = await this.clinicService.findMedicalRecordById(id);
      if (!medicalRecord) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Phiếu tiếp nhận không tồn tại',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin phiếu tiếp nhận thành công',
        data: medicalRecord,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.GET_LIST_MEDICAL_RECORD)
  async getListMedicalRecord(data: {
    clinicId?: string;
    patientId?: number;
    doctorId?: number;
    paymentStatus?: number;
  }) {
    try {
      const { clinicId, patientId, doctorId, paymentStatus } = data;
      const medicalRecords = await this.clinicService.findMedicalRecords({
        clinicId,
        patientId,
        doctorId,
        paymentStatus,
      });
      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách phiếu tiếp nhận thành công',
        data: medicalRecords,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.UPDATE_MEDICAL_RECORD_SERVICE)
  async updateMedicalRecordService(data: {
    medicalRecordId?: number;
    clinicServiceId?: number;
    code?: string;
    serviceResult?: string;
  }) {
    try {
      const { medicalRecordId, clinicServiceId, ...rest } = data;
      const medicalRecordService =
        await this.clinicService.findMedicalRecordService({
          medicalRecordId,
          clinicServiceId,
        });
      if (!medicalRecordService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Dịch vụ không tồn tại',
        };
      }
      const updatedMedicalRecordService =
        await this.clinicService.updateMedicalRecordService(
          medicalRecordService.id,
          rest,
        );
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật dịch vụ thành công',
        data: updatedMedicalRecordService,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.CREATE_MEDICAL_RECORD_SERVICE)
  async createMedicalRecordService(data: {
    medicalRecordId: number;
    clinicId: string;
    clinicServiceId: number;
    doctorId?: number | null;
    serviceResult?: string | null;
    serviceName?: string | null;
    amount?: number | null;
  }) {
    try {
      const { medicalRecordId, clinicServiceId, ...rest } = data;
      const medicalRecordServicePayload: Prisma.medicalRecordServicesUncheckedCreateInput =
        {
          medicalRecordId,
          clinicServiceId,
          paymentStatus: 0,
          ...rest,
        };
      const medicalRecordService =
        await this.clinicService.createMedicalRecordService(
          medicalRecordServicePayload,
        );
      if (!medicalRecordService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tạo dịch vụ thất bại',
        };
      }
      const medicalRecord =
        await this.clinicService.findMedicalRecordById(medicalRecordId);
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo dịch vụ thành công',
        data: medicalRecord,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.DELETE_MEDICAL_RECORD_SERVICE)
  async deleteMedicalRecordService(data: {
    medicalRecordId: number;
    clinicServiceId: number;
  }) {
    try {
      const { medicalRecordId, clinicServiceId } = data;
      const medicalRecordService =
        await this.clinicService.findMedicalRecordService({
          medicalRecordId,
          clinicServiceId,
        });
      if (!medicalRecordService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Dịch vụ không tồn tại',
        };
      }
      await this.clinicService.deleteMedicalRecordService({
        medicalRecordId,
        clinicServiceId,
      });
      const medicalRecord =
        await this.clinicService.findMedicalRecordById(medicalRecordId);
      return {
        status: HttpStatus.OK,
        message: 'Xóa dịch vụ thành công',
        data: medicalRecord,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.REQUEST_SERVICE)
  async requestService(data: any) {
    try {
      const { clinicServiceId, medicalRecordId, serviceName, serviceResult } =
        data;
      const code = customAlphabet(
        '1234567890abcdefghiklmnouwpqz',
        10,
      )(10).toUpperCase();
      const medicalRequestServicePayload: Prisma.clinicRequestServicesUncheckedCreateInput =
        {
          code,
          clinicServiceId,
          medicalRecordId,
          serviceName,
          serviceResult,
        };
      const clinicRequestService =
        await this.clinicService.createClinicRequestService(
          medicalRequestServicePayload,
        );
      if (!clinicRequestService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tạo yêu cầu dịch vụ thất bại',
        };
      }
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo yêu cầu dịch vụ thành công',
        data: clinicRequestService,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.UPDATE_REQUEST_SERVICE)
  async updateRequestService(data: {
    code: string;
    serviceName?: string;
    serviceResult?: string;
    medicalRecordId?: number;
    clinicServiceId?: number;
  }) {
    try {
      const { code, ...rest } = data;
      const clinicRequestService =
        await this.clinicService.findClinicRequestServiceByCode(code);
      if (!clinicRequestService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Yêu cầu dịch vụ không tồn tại',
        };
      }
      const updatedClinicRequestService =
        await this.clinicService.updateClinicRequestService(code, rest);
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật yêu cầu dịch vụ thành công',
        data: updatedClinicRequestService,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.GET_REQUEST_SERVICE_BY_CODE)
  async getRequestServiceByCode(data: any) {
    try {
      const { code } = data;
      const clinicRequestService =
        await this.clinicService.findClinicRequestServiceByCode(code);
      if (!clinicRequestService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Yêu cầu dịch vụ không tồn tại',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin yêu cầu dịch vụ thành công',
        data: clinicRequestService,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
        data: null,
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.CREATE_PATIENT_RECEPTION_2)
  async createPatientReception2(data: ICreatePatientReception) {
    try {
      const { clinicId, patientId, doctorId, services, ...rest } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const patient = await this.clinicService.findPatientById(patientId);
      if (!patient) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Bệnh nhân không tồn tại',
        };
      }
      const payload: Prisma.medicalRecordsUncheckedCreateInput = {
        patientId,
        doctorId,
        clinicId,
        examinationStatus: 0,
        paymentStatus: 0,
        dateCreated: new Date().toISOString(),
        ...rest,
      };
      const patientReception =
        await this.clinicService.createPatientReception(payload);
      if (!patientReception) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tạo phiếu tiếp nhận bệnh nhân thất bại',
        };
      }
      await Promise.all(
        map(services, async (service) => {
          try {
            const medicalRecordServicePayload: Prisma.medicalRecordServicesUncheckedCreateInput =
              {
                medicalRecordId: patientReception.id,
                amount: service.amount,
                clinicId,
                clinicServiceId: service.clinicServiceId,
                serviceName: service.serviceName,
                doctorId: service.doctorId,
              };
            return await this.clinicService.createMedicalRecordService(
              medicalRecordServicePayload,
            );
          } catch (error) {
            console.log(error);
          }
        }),
      );

      const medicalRecord = await this.clinicService.findMedicalRecordById(
        patientReception.id,
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo phiếu tiếp nhận bệnh nhân thành công',
        data: medicalRecord,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicStatiticsCommand.GET_CLINIC_STATITICS)
  async getStatistical(data: {
    clinicId: string;
    date?: string;
    days?: number;
  }) {
    try {
      const { clinicId, date, days } = data;
      let endDate = '';
      let startDate = '';
      if (days) {
        startDate = moment().subtract(days, 'days').format('YYYY-MM-DD');
        endDate = moment().format('YYYY-MM-DD');
      }
      const clinicStatistical = await this.clinicService.findClinicStatistical({
        clinicId,
        date,
        startDate,
        endDate,
      });
      if (!clinicStatistical) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Thống kê không tồn tại',
        };
      }
      const result = {
        totalPatients: sumBy(clinicStatistical, 'numberOfPatients'),
        totalAppointments: sumBy(clinicStatistical, 'numberOfAppointments'),
        totalRevenue: sumBy(clinicStatistical, 'revenue'),
      };
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin thống kê thành công',
        data: result,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.UPDATE_MEDICAL_RECORD_PRESCRIPTION)
  async updateMedicalRecordPrescription(data: {
    medicalRecordId: number;
    precriptions: {
      medicineName: string;
      dosage?: number;
      unit?: string;
      duration?: string;
      usingTime?: string;
      doseInterval?: string;
      note?: string;
    }[];
  }) {
    try {
      const { medicalRecordId, precriptions } = data;
      const medicalRecord =
        await this.clinicService.findMedicalRecordById(medicalRecordId);
      if (!medicalRecord) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Phiếu tiếp nhận không tồn tại',
        };
      }
      await this.clinicService.deletePrecriptionByMedicalRecordId(
        medicalRecordId,
      );
      await Promise.all(
        map(precriptions, async (precription) => {
          try {
            const medicalRecordPrecriptionPayload: Prisma.prescriptionDetailUncheckedCreateInput =
              {
                medicalRecordId,
                ...precription,
              };
            return await this.clinicService.createPrescriptionDetail(
              medicalRecordPrecriptionPayload,
            );
          } catch (error) {
            console.log(error);
          }
        }),
      );
      const medicalRecordResult =
        await this.clinicService.findMedicalRecordById(medicalRecordId);
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật phiếu tiếp nhận thành công',
        data: medicalRecordResult,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.EXPORT_INVOICE)
  async exportInvoice(data: any) {
    try {
      const { medicalRecordId } = data;
      const medicalRecord =
        await this.clinicService.findMedicalRecordById(medicalRecordId);
      if (!medicalRecord) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Phiếu tiếp nhận không tồn tại',
        };
      }
      const exInvoice =
        await this.clinicService.findInvestmentInvoiceByMedicalRecordId(
          medicalRecordId,
        );
      if (exInvoice) {
        const { patient: patientInfo, cashier, ...restInvoice } = exInvoice;
        const { patient: patientUserInfo, ...restPatient } = patientInfo;
        const { users, ...restCashierInfo } = cashier;
        return {
          status: HttpStatus.OK,
          message: 'Xuất hóa đơn thành công',
          data: {
            ...restInvoice,
            patient: {
              ...restPatient,
              ...patientUserInfo,
            },
            cashier: {
              ...restCashierInfo,
              ...users,
            },
          },
        };
      }
      const { medicalRecordServices } = medicalRecord;
      const totalPayment = sumBy(medicalRecordServices, 'amount') || 0;
      const payload: Prisma.investmentInvoiceUncheckedCreateInput = {
        patientId: medicalRecord.patientId,
        clinicId: medicalRecord.clinicId,
        medicalRecordId: medicalRecordId,
        invoiceDate: moment().format('YYYY-MM-DD'),
        description: `Thanh toán hóa đơn khám bệnh tại ${medicalRecord.clinic?.name}#${medicalRecordId}`,
        totalPayment,
      };
      const invoice = await this.clinicService.createInvestmentInvoice(payload);
      if (!invoice) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Xuất hóa đơn thất bại',
        };
      }
      await Promise.all(
        map(medicalRecordServices, async (service) => {
          try {
            const invoiceDetailPayload: Prisma.invoiceDetailUncheckedCreateInput =
              {
                invoiceId: invoice.id,
                amount: service.amount,
                content: `Phí thanh toán cho dịch vụ ${service.serviceName} là ${service.amount} VNĐ`,
              };
            return await this.clinicService.createInvoiceDetail(
              invoiceDetailPayload,
            );
          } catch (error) {
            console.log(error);
          }
        }),
      );

      const finalInvoice = await this.clinicService.findInvestmentInvoiceById(
        invoice.id,
      );
      if (!finalInvoice) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Xuất hóa đơn thất bại',
        };
      }
      const { patient: patientInfo, cashier, ...restInvoice } = finalInvoice;
      const { patient: patientUserInfo, ...restPatient } = patientInfo;
      const { users, ...restCashierInfo } = cashier;
      return {
        status: HttpStatus.OK,
        message: 'Xuất hóa đơn thành công',
        data: {
          ...restInvoice,
          patient: {
            ...restPatient,
            ...patientUserInfo,
          },
          cashier: {
            ...restCashierInfo,
            ...users,
          },
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Xuất hóa đơn thất bại',
      };
    }
  }

  @MessagePattern(PatientReceptionCommand.UPDATE_INVOICE)
  async updateInvoice(data: {
    status?: number;
    cashierId?: number;
    invoiceId: number;
  }) {
    try {
      const { invoiceId, ...rest } = data;
      const invoice =
        await this.clinicService.findInvestmentInvoiceById(invoiceId);
      if (!invoice) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Hóa đơn không tồn tại',
        };
      }
      await this.clinicService.updateInvestmentInvoice(invoiceId, rest);
      if (data.status && data.status === 1) {
        await this.clinicService
          .updateClinicStatistical({
            date: moment().format('YYYY-MM-DD'),
            clinicId: invoice.clinicId,
            payload: {
              revenue: invoice.totalPayment,
            },
          })
          .catch((error) => {
            console.log(error);
          });
        // update payment status of medical record
        await this.clinicService.updateMedicalRecord(invoice.medicalRecordId, {
          paymentStatus: 1,
        });
      }
      const finalInvoice =
        await this.clinicService.findInvestmentInvoiceById(invoiceId);
      if (!finalInvoice) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Xuất hóa đơn thất bại',
        };
      }
      const { patient: patientInfo, cashier, ...restInvoice } = finalInvoice;
      const { patient: patientUserInfo, ...restPatient } = patientInfo;
      const { users, ...restCashierInfo } = cashier;
      return {
        status: HttpStatus.OK,
        message: 'Xuất hóa đơn thành công',
        data: {
          ...restInvoice,
          patient: {
            ...restPatient,
            ...patientUserInfo,
          },
          cashier: {
            ...restCashierInfo,
            ...users,
          },
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Cập nhật hóa đơn thất bại',
      };
    }
  }
}
