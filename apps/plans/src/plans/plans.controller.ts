import { Controller, Get } from '@nestjs/common';
import { PlanService } from './plans.service';

@Controller()
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  getHello(): string {
    return this.planService.getHello();
  }
}
