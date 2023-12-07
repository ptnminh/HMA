import { Controller } from '@nestjs/common';
import { ClinicService } from './clinics.service';

@Controller()
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}
}
