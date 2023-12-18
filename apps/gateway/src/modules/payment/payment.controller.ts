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
    Req
  } from '@nestjs/common';
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
  import { VnpayOrderDto } from './dto';
  import { Request } from 'express';
import { PaymentCommand } from './command';
import { ZalopayOrderDto } from './dto/zalopay-order.dto';
  
  @Controller('payment')
  @ApiTags('Payment')
  /*@UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')*/
  export class PaymentController {
    constructor(
      @Inject('PAYMENT_SERVICE') private readonly paymentServiceClient: ClientProxy,
    ) {}


    @Post('zalopay/create')
    async zalopayCreateOrder(@Body() dto: ZalopayOrderDto) {

      const paymentServiceResponse = await firstValueFrom(this.paymentServiceClient.send(
        PaymentCommand.ZALOPAY_CREATE_ORDER, {...dto}
      ))

      if(paymentServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException( 
          {
            message: paymentServiceResponse.message,
            data: null,
            status: false
          },
          paymentServiceResponse.status
        )
      }
      return {
        message: paymentServiceResponse.message,
        data: paymentServiceResponse.data,
        status: true,
      }
    }

    @Post('vnpay/create')
    async vnpayCreateOrder(@Body() dto: VnpayOrderDto, @Req() req: Request) {
      const ipAddr =  req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress

      const paymentServiceResponse = await firstValueFrom(this.paymentServiceClient.send(
        PaymentCommand.VNPAY_CREATE_ORDER, {dto, ipAddr}
      ))

      if(paymentServiceResponse.status !== HttpStatus.OK) {
        throw new HttpException( 
          {
            message: paymentServiceResponse.message,
            data: null,
            status: false
          },
          paymentServiceResponse.status
        )
      }
      return {
        message: paymentServiceResponse.message,
        data: paymentServiceResponse.data,
        status: true,
      }
    }
  }