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
  Headers,
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
import { IsMobile } from 'src/decorators/device.decorator';

@Controller('payment')
@ApiTags('Payment')
/*@UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')*/
export class PaymentController {
  constructor(
    @Inject('PAYMENT_SERVICE')
    private readonly paymentServiceClient: ClientProxy,
  ) {}

  @Post()
  async createOrder(@Body() dto: paymentDto, @Req() req: Request) {
    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
    if (dto.returnUrl === '' || dto.returnUrl === undefined) {
      dto.returnUrl = process.env.BACKEND_URL + '/api/payment/return';
    }
    const paymentServiceResponse = await firstValueFrom(
      this.paymentServiceClient.send(PaymentCommand.CREATE_ORDER, {
        dto,
        ipAddr,
      }),
    );

    if (paymentServiceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: paymentServiceResponse.message,
          data: null,
          status: false,
        },
        paymentServiceResponse.status,
      );
    }
    return {
      message: paymentServiceResponse.message,
      data: paymentServiceResponse.data,
      status: true,
    };
  }

  @ApiExcludeEndpoint()
  @Get('return')
  async testGet(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('origin') origin: string,
    @IsMobile() isMobile: boolean,
  ) {
    try {
      var params = req.query;
      params['body'] = req.body;
      const paymentServiceResponse = await firstValueFrom(
        this.paymentServiceClient.send(PaymentCommand.HANDLE_CALLBACK, {
          ...params,
        }),
      );
      const baseMobileUrl =
        'https://clinus.page.link?apn=com.nhatminh287.Mobileapppatient&link=';
      const encodeUrl = encodeURIComponent(
        'https://clinus.page.link/payment?' + paymentServiceResponse.data,
      );
      const mobileUrl = baseMobileUrl + encodeUrl;
      var host = process.env.FRONTEND_URL + '/thanh-toan/thong-tin-thanh-toan?';
      console.log(req.query);
      return !isMobile
        ? res.redirect(host + paymentServiceResponse.data)
        : res.redirect(mobileUrl);
    } catch (error) {
      res.redirect(process.env.FRONTEND_URL);
      console.log(error);
    }
  }
}
