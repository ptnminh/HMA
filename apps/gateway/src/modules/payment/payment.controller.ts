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
    Req,
    Res, 
    Headers
  } from '@nestjs/common';
  import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiExcludeEndpoint,
    ApiHideProperty,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
  } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
  import { ClientProxy, MessagePattern } from '@nestjs/microservices';
  import { firstValueFrom } from 'rxjs';
  import { Request, Response, response } from 'express';
import { PaymentCommand } from './command';
import { paymentDto } from './dto/payment.dto';
  
  @Controller('payment')
  @ApiTags('Payment')
  /*@UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')*/
  export class PaymentController {
    constructor(
      @Inject('PAYMENT_SERVICE') private readonly paymentServiceClient: ClientProxy,
    ) {}

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Bearer')
    @Post()
    async createOrder(@Body() dto: paymentDto, @Req() req: Request) {
      const ipAddr =  req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress
      if (dto.returnUrl === '' || dto.returnUrl === undefined) {
        dto.returnUrl = process.env.BACKEND_URL +  '/api/payment/return'
      }
      const paymentServiceResponse = await firstValueFrom(this.paymentServiceClient.send(
        PaymentCommand.CREATE_ORDER, {dto, ipAddr}
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



    @ApiExcludeEndpoint()
    @Get('return')
    async testGet(@Req() req: Request, @Res() res: Response, @Headers('origin') origin: string) {
      try {
        var params = req.query
        params['body'] = req.body
        const paymentServiceResponse = await firstValueFrom(this.paymentServiceClient.send(PaymentCommand.HANDLE_CALLBACK, {...params}))
        var host = process.env.FRONTEND_URL +'/thanh-toan/thong-tin-thanh-toan?'
        console.log(req.query)
        res.redirect(host + paymentServiceResponse.data) 
      }
      catch(error) {
        res.redirect(process.env.FRONTEND_URL)
        console.log(error)
      }
    }
  }