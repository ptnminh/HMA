import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
  Inject,
  HttpStatus,
  HttpException,
  GatewayTimeoutException,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreatePlanDto,
  CreatePlanOptionDto,
  CreatePlanOptionResponse,
  CreatePlanResponse,
} from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PlanCommand } from './command';
import { GetAllActiveOptionResponse } from './dto/get-option.dto';

@Controller('plans')
@ApiTags('Plans')
/*@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Bearer')*/
export class PlansController {
  constructor(
    @Inject('PLAN_SERVICE') private readonly planServiceClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Post()
  @ApiCreatedResponse({ type: CreatePlanResponse })
  async create(@Body() createPlanDto: CreatePlanDto) {
    const planServiceResponse = await firstValueFrom(
      this.planServiceClient.send(PlanCommand.PLAN_CREATE, createPlanDto),
    );
    if (planServiceResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: planServiceResponse.message,
          data: null,
          status: false,
        },
        planServiceResponse.status,
      );
    }
    return {
      message: planServiceResponse.message,
      data: planServiceResponse.data,
      status: true,
    };
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Put(':id')
  @ApiOkResponse({ type: CreatePlanResponse })
  async update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    const planServiceResponse = await firstValueFrom(
      this.planServiceClient.send(PlanCommand.PLAN_UPDATE, {
        id: parseInt(id),
        ...updatePlanDto,
      }),
    );
    if (planServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: planServiceResponse.message,
          data: null,
          status: false,
        },
        planServiceResponse.status,
      );
    }
    return {
      message: planServiceResponse.message,
      data: planServiceResponse.data,
      status: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Post('option')
  @ApiOkResponse({ type: CreatePlanOptionResponse })
  async createOption(@Body() createOptionDto: CreatePlanOptionDto) {
    const planServiceResponse = await firstValueFrom(
      this.planServiceClient.send(PlanCommand.CREATE_OPTION, createOptionDto),
    );
    if (planServiceResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: planServiceResponse.message,
          data: null,
          status: false,
        },
        planServiceResponse.status,
      );
    }
    return {
      message: planServiceResponse.message,
      data: planServiceResponse.data,
      status: true,
    };
  }


  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
  })
  @ApiCreatedResponse({ type: GetAllActiveOptionResponse })
  @Get('options')
  async getAllOptions(@Query('isActive') isActive: boolean) {
    const planServiceResponse = await firstValueFrom(
      this.planServiceClient.send(PlanCommand.GET_ALL_ACTIVE_OPTION, {
        isActive,
      }),
    );
    if (planServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: planServiceResponse.message,
          data: null,
          status: false,
        },
        planServiceResponse.status,
      );
    }
    return {
      message: planServiceResponse.message,
      data: planServiceResponse.data,
      status: true,
    };
  }


  @Get(':id')
  async getPlanByID(@Param('id') id: string) {
    const getPlanResponse = await firstValueFrom(
      this.planServiceClient.send(PlanCommand.GET_PLAN_BY_ID, {
        id: parseInt(id),
      }),
    );
    if (getPlanResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: getPlanResponse.message,
          data: null,
          status: false,
        },
        getPlanResponse.status,
      );
    }
    return {
      message: getPlanResponse.message,
      status: true,
      data: getPlanResponse.data,
    };
  }


  @Get()
  async getAllPlans() {
    const planServiceResponse = await firstValueFrom(
      this.planServiceClient.send(PlanCommand.GET_ALL_PLAN, {}),
    );
    if (planServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: planServiceResponse.message,
          data: null,
          status: false,
        },
        planServiceResponse.status,
      );
    }
    return {
      message: planServiceResponse.message,
      data: planServiceResponse.data,
      status: true,
    };
  }
}
