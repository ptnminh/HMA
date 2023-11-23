import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanService {
  getHello(): string {
    return 'Hello World!';
  }
}
