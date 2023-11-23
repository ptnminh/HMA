import { Controller, HttpStatus } from '@nestjs/common';
import { PlanService } from './plans.service';
import { MessagePattern } from '@nestjs/microservices';
import { PlanCommand } from './command';

@Controller()
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @MessagePattern(PlanCommand.PLAN_CREATE)
  async createPlan(data: any) {
    try {
      const plan = await this.planService.createPlan(data);
      return {
        status: HttpStatus.CREATED,
        message: 'Tạo thành công',
        data: plan,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PlanCommand.PLAN_UPDATE)
  async updatePlan(data: any) {
    try {
      const { id, ...rest } = data;
      const plan = await this.planService.updatePlan(id, rest);
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật thành công',
        data: plan,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  @MessagePattern(PlanCommand.CREATE_OPTION)
  async createOption(data: any) {
    try {
      const plan = await this.planService.createOption(data);
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật thành công',
        data: plan,
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
