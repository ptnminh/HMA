import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Inject,
  HttpStatus,
  HttpException,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreateClinicDto,
  CreateClinicResponse,
  CreateUserGroupRoleDTO,
  GetUsersInClinicResponse,
  ListClinicResponse,
  SubcribePlanDTO,
  SubcribePlanResponse,
  UpdateSubcribePlanDTO,
  UpdateUserGroupRoleDTO,
} from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ClinicCommand } from './command';
import { CurrentUser } from 'src/decorators';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateClinicServiceDto } from './dto/create-clinic-service.dto';
import { UpdateClinicServiceDto } from './dto/update-clinic-service.dto';
import { GetClinicsDto } from './dto/query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('clinics')
@ApiTags('Clinics')
export class ClinicsController {
  constructor(
    @Inject('CLINIC_SERVICE')
    private readonly clinicServiceClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Post()
  @ApiCreatedResponse({ type: CreateClinicResponse })
  async create(
    @Body() createClinicDto: CreateClinicDto,
    @CurrentUser('id') ownerId: string,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.CLINIC_CREATE, {
        ...createClinicDto,
        ownerId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }
  @Get('permissions')
  async getPermissions(@CurrentUser('id') userId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.GET_PERMISSIONS, {
        userId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }
  @Get(':id')
  @ApiOkResponse()
  async getClinicDetail(@Param('id') clinicId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.GET_CLINIC_DETAIL, {
        clinicId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }

    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Get()
  @ApiOkResponse({ type: ListClinicResponse })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: GetClinicsDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.CLINIC_LIST, {
        userId,
        query,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Put(':id')
  @ApiOkResponse({ type: CreateClinicResponse })
  async update(
    @Param('id') id: string,
    @Body() updateClinicDto: UpdateClinicDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.UPDATE_CLINIC, {
        ...updateClinicDto,
        id,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Post(':id/add-user-to-clinic/:userId')
  @ApiOkResponse({ type: CreateClinicResponse })
  async addUserToClinic(
    @Param('id') clinicId: string,
    @Param('userId') userId: string,
    @Query('roleId') roleId: number,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.ADD_USER_TO_CLINIC, {
        clinicId,
        userId,
        roleId: +roleId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Get('subscribe-plan/:subscribePlanId')
  async getSubscription(@Param('subscribePlanId') subscribePlanId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.GET_SUBSCRIBE_PLAN, {
        subscribePlanId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Post(':clinicId/subscribe-plan/:planId')
  @ApiOkResponse({ type: SubcribePlanResponse })
  async subscribePlan(@Body() data: SubcribePlanDTO) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.SUBSCRIBE_PLAN, data),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Put(':clinicId/subscribe-plan/:subscribePlanId')
  async updateSubscribePlan(
    @Param('clinicId') clinicId: string,
    @Param('subscribePlanId') subscribePlanId: string,
    @Body() data: UpdateSubcribePlanDTO,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.UPDATE_SUBSCRIBE_PLAN, {
        data,
        clinicId,
        subscribePlanId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Get(':id/users')
  @ApiOkResponse({ type: GetUsersInClinicResponse })
  async getUsers(@Param('id') clinicId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.GET_USERS_BY_CLINIC, {
        clinicId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Post(':id/create-user-group-role')
  async createUserGroupRole(
    @Body() data: CreateUserGroupRoleDTO,
    @Param('id') clinicId: string,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.CREATE_USER_GROUP_ROLE, {
        data,
        clinicId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }
  
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Delete(':id/delete-user-group-role/:userGroupRoleId')
  async deleteUserGroupRole(
    @Param('id') clinicId: string,
    @Param('userGroupRoleId') userGroupRoleId: string,
    @CurrentUser('id') userId: string,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.DELETE_USER_GROUP_ROLE, {
        clinicId,
        userGroupRoleId: +userGroupRoleId,
        userId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Put(':id/update-user-group-role/:userGroupRoleId')
  async updateUserGroupRole(
    @Param('id') clinicId: string,
    @Param('userGroupRoleId') userGroupRoleId: string,
    @Body() data: UpdateUserGroupRoleDTO,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.UPDATE_USER_GROUP_ROLE, {
        clinicId,
        userGroupRoleId: +userGroupRoleId,
        data,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Get(':id/user-group-role')
  async getUserGroupRole(@Param('id') clinicId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.GET_USER_GROUP_ROLE, {
        clinicId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Post(':clinicId/services')
  async createClinicService(
    @Param('clinicId') clinicId: string,
    @Body() dto: CreateClinicServiceDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.CREATE_CLINIC_SERVICE, {
        clinicId,
        ...dto,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  @Put('/services/:id')
  async updateClinicService(
    @Param('id') id: string,
    @Body() dto: UpdateClinicServiceDto,
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.UPDATE_CLINIC_SERVICE, {
        id: +id,
        ...dto,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Get('services/:id')
  async findClinicServiceById(@Param('id') id: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.GET_CLINIC_SERVICE_BY_ID, {
        id: +id,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @ApiQuery({name: "isDisabled", required: false})
  @Get(':clinicId/services')
  async findClinicServiceByClinicId(
    @Param('clinicId') clinicId: string,
    @Query('isDisabled') isDisabled: boolean
  ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(
        ClinicCommand.GET_CLINIC_SERVICE_BY_CLINIC_ID,
        {
          clinicId,
          isDisabled
        },
      ),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @UseGuards(JwtAuthGuard)
@ApiBearerAuth('Bearer')
  @Delete('/services/:id')
  async deleteClinicService(@Param('id') id: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.DELETE_CLINIC_SERVICE, {
        id: +id,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Get('/categories/:categoryId')
  async findCategoryById(@Param('categoryId') categoryId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.FIND_CATEGORY_BY_ID, {
        id: +categoryId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Post(':clinicId/categories')
  async createCategory(@Param('clinicId') clinicId: string, @Body() dto: CreateCategoryDto) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.CREATE_CATEGORY, {
        clinicId,
        ...dto
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Put('/categories/:categoryId')
  async updateCategoryById(@Param('categoryId') categoryId: string, @Body() dto: UpdateCategoryDto) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.UPDATE_CATEGORY, {
        id: +categoryId,
        ...dto
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @Delete('/categories/:categoryId')
  async deleteCategoryById(@Param('categoryId') categoryId: string) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.DELETE_CATEGORY, {
        id: +categoryId,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }

  @ApiQuery({name: "name", required: false})
  @ApiQuery({name: "type", required: false})
  @Get('/:clinicId/categories/')
  async searchCategory(
    @Param('clinicId') clinicId: string,
    @Query('name') name: string,
    @Query('type') type: string
    ) {
    const clinicServiceResponse = await firstValueFrom(
      this.clinicServiceClient.send(ClinicCommand.SEARCH_CATEGORY, {
        clinicId: clinicId,
        name: name,
        type: +type,
      }),
    );
    if (clinicServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: clinicServiceResponse.message,
          data: null,
          status: false,
        },
        clinicServiceResponse.status,
      );
    }
    return {
      message: clinicServiceResponse.message,
      data: clinicServiceResponse.data,
      status: true,
    };
  }
}
