import { Controller, HttpStatus } from '@nestjs/common';
import { ClinicService } from './clinics.service';
import { MessagePattern } from '@nestjs/microservices';
import { ClinicCommand } from './command';
import { Prisma } from '@prisma/client';

@Controller()
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}
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
  async listClinic() {
    try {
      const clinics = await this.clinicService.findAll();
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
}
