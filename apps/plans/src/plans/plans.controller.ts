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
      const { optionIds, ...rest } = data;
      const plan = await this.planService.createPlan(rest);
      if (optionIds && optionIds.length > 0 && plan) {
        await this.planService.createPlanOption(plan.id, optionIds);
      }
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
      const { id, optionIds, ...rest } = data;
      const plan = await this.planService.updatePlan(id, rest);
      if (plan) {
        // delete old options plan
        await this.planService.deletePlanOption(id);
        // create new options plan
        await this.planService.createPlanOption(id, optionIds);
      }
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
        status: HttpStatus.CREATED,
        message: 'Tạo option thành công',
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

  @MessagePattern(PlanCommand.GET_ALL_ACTIVE_OPTION)
  async getAllActiveOptions() {
    try {
      const option = await this.planService.findAllActiveOption();
      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách option thành công',
        data: option,
      };
    } catch (error) {
      console.log(error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi hệ thống',
      };
    }
  }

  async getPlanById(data: { id: string }) {
    try {
      const plan = await this.planService.findPlanById(parseInt(data.id));
      if (!plan) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Gói không tồn tại',
          data: null,
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Tìm kiếm thành công',
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

  @MessagePattern(PlanCommand.GET_ALL_PLAN)
  async getAllPlans() {
    try {
      const plan = await this.planService.findAllPlan();
      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách plan thành công',
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
