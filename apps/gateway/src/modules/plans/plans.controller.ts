import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto, CreatePlanResponse } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('plans')
@ApiTags('Plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Bearer')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiCreatedResponse({ type: CreatePlanResponse })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(+id, updatePlanDto);
  }
}
