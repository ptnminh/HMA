import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { ClinicService } from './clinics.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { ClinicCommand } from './command';
import { Prisma } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import moment from 'moment-timezone';
import { SUBSCRIPTION_STATUS } from 'src/shared';

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

      const plan = await this.clinicService.getPlanDetail(planId);
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
      const payload: Prisma.userInClinicsUncheckedCreateInput = {
        userId: data.ownerId,
        clinicId: clinic.id,
        isOwner: true,
        roleId: clinicGroupRole.id,
      };
      await this.clinicService.addUserToClinic(payload);

      // subscribe plan
      const payloadSubcribePlan: Prisma.subscriptionsUncheckedCreateInput = {
        planId,
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
      const { ownerId } = data;
      let clinics;
      if (ownerId !== null || ownerId !== undefined || ownerId !== '') {
        clinics = await this.clinicService.findAll(ownerId);
      } else {
        clinics = await this.clinicService.findClinics();
      }
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
      const payload: Prisma.userInClinicsUncheckedCreateInput = {
        userId,
        clinicId,
        isOwner: false,
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
          return {
            ...user,
            ...user.users,
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
          return {
            ...user,
            ...user.users,
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
      const permissions = await this.clinicService.getPermissions(true);
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
        permissions.map(async (permission) =>
          this.clinicService.createRolePermissions({
            roleId: clinicGroupRole.id,
            permissionId: permission.id,
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
}
