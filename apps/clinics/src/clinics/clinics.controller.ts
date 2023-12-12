import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { ClinicService } from './clinics.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { ClinicCommand } from './command';
import { Prisma } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

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
      const clinic = await this.clinicService.create(data);
      const payload: Prisma.userInClinicsUncheckedCreateInput = {
        userId: data.ownerId,
        clinicId: clinic.id,
        isOwner: true,
        roleId: 1,
      };
      await this.clinicService.addUserToClinic(payload);
      await firstValueFrom(
        this.authServiceClient.send(ClinicCommand.UPDATE_USER, {
          id: data.ownerId,
          moduleId: 2,
        }),
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo clinic thành công',
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

  @MessagePattern(ClinicCommand.CLINIC_LIST)
  async listClinic(data: any) {
    try {
      const { ownerId } = data;
      const clinics = await this.clinicService.findAll(ownerId);
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
      const { clinicId, planId, expiredAt } = data;
      const clinic = await this.clinicService.findClinicById(clinicId);
      if (!clinic) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Clinic không tồn tại',
        };
      }
      const payload: Prisma.subscriptionsUncheckedCreateInput = {
        currentPlanId: planId,
        clinicId,
        expiredAt,
      };
      await this.clinicService.subcribePlan(payload);
      return {
        status: HttpStatus.OK,
        message: 'Subscribe plan thành công',
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
