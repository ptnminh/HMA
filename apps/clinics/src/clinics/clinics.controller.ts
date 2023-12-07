import { Controller, HttpStatus } from '@nestjs/common';
import { ClinicService } from './clinics.service';
import { MessagePattern } from '@nestjs/microservices';
import { ClinicCommand } from './command';

@Controller()
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}
  @MessagePattern(ClinicCommand.CLINIC_CREATE)
  async createClinic(data: any) {
    try {
      const clinic = await this.clinicService.create(data);
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo option thành công',
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
        message: 'Lấy danh sách option thành công',
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
}
