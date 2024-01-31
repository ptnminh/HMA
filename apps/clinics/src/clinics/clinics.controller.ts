import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { ClinicService } from './clinics.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { ClinicCommand } from './command';
import { Prisma } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment-timezone';
import { BookingStatus, SUBSCRIPTION_STATUS } from 'src/shared';
import { map } from 'lodash';
import { isContainSpecialChar } from './utils';

@Controller()
export class ClinicController {
  constructor(
    private readonly clinicService: ClinicService,
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
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
      const { clinicId, ...payload } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const preparedPayload: Prisma.clinicServicesUncheckedCreateInput = {
        clinicId,
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
    patientId: number;
    startTime: string;
    endTime?: string;
    date: string;
  }) {
    try {
      const appointment = await this.clinicService.createAppointment({
        ...data,
        status: BookingStatus.PENDING,
      });
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
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin clinic service thành công',
        data: clinicService,
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
      const { clinicId } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const clinicServices =
        await this.clinicService.findClinicServiceByClinicId(clinicId);
      return {
        status: HttpStatus.OK,
        message: 'Lấy thông tin clinic service thành công',
        data: clinicServices,
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
      const { id, ...payload } = data;
      const clinicService = await this.clinicService.findClinicServiceById(id);
      if (!clinicService) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic service không tồn tại',
        };
      }
      const preparedPayload: Prisma.clinicServicesUncheckedUpdateInput = {
        id,
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
      const {clinicId, ...rest} = data
      const clinic  = await this.clinicService.findClinicById(clinicId)
      if (!clinic){
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Clinic không tồn tại"
        }
      }
      const  payload: Prisma.categoryUncheckedCreateInput = {
        clinicId,
        ...rest
      }

      const category = await this.clinicService.createCategory(payload)
      if (!category)  {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Tạo categoty thất bại"
        }
      }
      return {
        data: category,
        status: HttpStatus.CREATED,
        message: "Tạo category thành công"
      }
    } catch(error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.FIND_CATEGORY_BY_ID)
  async findCategoryById(data: any) {
    try {
      const {id} = data
      const category = await this.clinicService.findCategoryById(id)
      if (!category) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Tìm kíếm thất bại"
        }
      }
      return {
        status: HttpStatus.OK,
        message: "Tìm kiếm thành công",
        data: category
      }
    }
    catch(error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Lỗi hệ thống",
      }
    }
  }

  @MessagePattern(ClinicCommand.UPDATE_CATEGORY)
  async updateCategoty(data: any) {
    try {
      const {id, ...rest} = data
      const category = await this.clinicService.findCategoryById(id)
      if (!category) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Category không tồn tại"
        }
      }
      const updatePayload: Prisma.categoryUncheckedUpdateInput = {
        ...rest,
      }
      const updatedCategory = await this.clinicService.updateCategory(updatePayload, id)
      return {
        status: HttpStatus.OK,
        message: "Cập nhật category thành công",
        data: updatedCategory,
      }
    } catch (error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.SEARCH_CATEGORY)
  async searchCategory(data: any) {
    try {
      const {clinicId, name, type} = data
      if(name && isContainSpecialChar(name)) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Tên phân loại không hợp lệ",
        }
      }
      const categories = await this.clinicService.searchCategory(clinicId, name, type)
      return {
        status: HttpStatus.OK,
        message: "Tìm kiếm thành công",
        data: categories,
      }
    }
    catch(error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.DELETE_CATEGORY)
  async deleteCategory(data: any) {
    try {
      const {id} = data
      const category = await this.clinicService.findCategoryById(id)
      if (!category) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Category không tồn tại"
        }
      }
      await this.clinicService.deleteCategory(id)
      const deletedCategory = await this.clinicService.findCategoryById(id)
      if (deletedCategory) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Xóa Category thất bại"
        }
      }
      await this.clinicService.updateClinicServiceByCategoryId(category.id, {categoryId: null})
      await this.clinicService.updateMedicalSuppliersByCategoryId(category.id, {categoryId: null})
      return {
        status: HttpStatus.OK,
        message: "Xóa Category thành công",
      }
    }
    catch(error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(ClinicCommand.CREATE_NEWS)
  async createNews(data: any) {
    try{
      const {clinicId, ...rest} = data
      const clinic = await this.clinicService.findClinicById(clinicId)
      if(!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Clinic không tồn tại",
        }
      }
      const payload: Prisma.clinicNewsUncheckedCreateInput = {
        clinicId,
        ...rest,
      }
      const news = await this.clinicService.createNews(payload)
      if (!news) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Tạo tin tức thất bại",
        }
      }
      return {
        status: HttpStatus.CREATED,
        message: "Tạo tin tức thành công",
        data: news,
      }
    }
    catch(error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      }
    }
  }

  @MessagePattern(ClinicCommand.FIND_NEWS_BY_ID)
  async getNewsById(data: any) {
    try {
      const {id} = data
      const news = await this.clinicService.findNewsById(id)
      if (!news) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Tin tức không tồn tại",
        }
      }
      return {
        status: HttpStatus.OK,
        message: "Tìm kiếm tin tức thành công",
        data: news,
      }
    }
    catch(error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      }
    }
  }

  @MessagePattern(ClinicCommand.UPDATE_NEWS)
  async updateNews(data: any) {
    try {
      const {id, ...rest} =data
      const news = await this.clinicService.findNewsById(id)
      if (!news) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Tin tức không tồn tại",
        }
      }
      const updatedNews = await this.clinicService.updateNews(id, rest)
      return {
        status: HttpStatus.OK,
        message: "Cập nhật tin tức thành công",
        data: updatedNews,
      }
    }
    catch(error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      }
    }
  }

  @MessagePattern(ClinicCommand.DELETE_NEWS)
  async deleteNews(data: any) {
    try {
      const {id} = data
      const news = await this.clinicService.findNewsById(id)
      if (!news) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Tin tức không tồn tại",
        }
      }
      await this.clinicService.deleteNews(id)
      const deletedNews = await this.clinicService.findNewsById(id)
      if (deletedNews) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Xóa tin tức thất bại",
        }
      }
      return {
        data: null,
        status: HttpStatus.OK,
        message: "Xóa tin tức thành công",
      }
    }
    catch(error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      }
    }
  }


  @MessagePattern(ClinicCommand.SEARCH_NEWS)
  async searchNews(data: any) {
    try {
      const {clinicId, title, isShow, page, size} = data
      if(!clinicId && !title && !isShow) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Không có dữ liệu tìm kiếm",
        }
      }
      if(title && isContainSpecialChar(title)) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Tên phân loại không hợp lệ",
        }
      }
      const news = await this.clinicService.searchNews(
        clinicId,
        title,
        isShow,
      )
      const total = news.length

      const result = []
      var minIndex = page*size
      var maxIndex = ((page+1)*size<total)? (page+1)*size : total
      for(var i = minIndex; i< maxIndex; i++) {
        result.push(news[i])
      }

      return {
        status: HttpStatus.OK,
        message: "Tìm kiếm thành công",
        data: {
          data: result,
          pageSize: size,
          currentPage: page+1,
          total,
        }
      }
    }
    catch(error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }}

