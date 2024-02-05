import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
    Delete,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import { ClientProxy } from '@nestjs/microservices';
  import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
  import { GetAppointmentsQueryDto } from '../clinics/dto/create-clinic.dto';
  import { firstValueFrom } from 'rxjs';
  import { ClinicCommand } from '../clinics/command';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

  @ApiTags('News')
  @Controller('news')
  export class NewsController{

    constructor(
      @Inject('CLINIC_SERVICE')
      private readonly clinicServiceClient: ClientProxy,
    ) {}

    @Post()
    async createNews( @Body() dto: CreateNewsDto) {
      const clinicServiceResponse = await firstValueFrom(
        this.clinicServiceClient.send(ClinicCommand.CREATE_NEWS, {
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

    @Get('/:newsId')
    async getNewsById(@Param('newsId') newsId: string) {
      const clinicServiceResponse = await firstValueFrom(
        this.clinicServiceClient.send(ClinicCommand.FIND_NEWS_BY_ID, {
          id: +newsId
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

    @Put('/:newsId')
    async updateNews(@Param('newsId') newsId: string, @Body() dto: UpdateNewsDto) {
      const clinicServiceResponse = await firstValueFrom(
        this.clinicServiceClient.send(ClinicCommand.UPDATE_NEWS, {
          id: +newsId,
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

    @Delete('/:newsId')
    async deleteNews(@Param('newsId') newsId: string) {
      const clinicServiceResponse = await firstValueFrom(
        this.clinicServiceClient.send(ClinicCommand.DELETE_NEWS, {
          id: +newsId
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

    @ApiQuery({name: 'clinicId', required: false})
    @ApiQuery({name: 'title', required: false})
    @ApiQuery({name: 'isShow', required: false})
    @ApiQuery({name: 'pageSize', required: false})
    @ApiQuery({name: 'pageIndex', required: false})
    @Get()
    async searchNews(
      @Query('clinicId') clinicId?: string,
      @Query('title') title?: string,
      @Query('isShow') isShow?: Boolean,
      @Query('pageSize') pageSize?: number,
      @Query('pageIndex') pageIndex?: number,
    ) {
      const clinicServiceResponse = await firstValueFrom(
        this.clinicServiceClient.send(ClinicCommand.SEARCH_NEWS, {
          clinicId,
          title,
          isShow,
          size: pageSize? +pageSize : 10,
          page: pageIndex? +pageIndex : 0,
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