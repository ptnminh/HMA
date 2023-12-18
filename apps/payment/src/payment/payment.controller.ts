import { Controller, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MessagePattern } from '@nestjs/microservices';
import { PaymentCommand } from './command';


@Controller('payment')
export class PaymentController {
    constructor(private paymenService: PaymentService) {}

    @MessagePattern(PaymentCommand.VNPAY_CREATE_ORDER)
    async VnpayCreateOrder(data: any) {
        try {
            const {dto, ipAddr} = data
            const url = await this.paymenService.vnpayCreateOrder(dto, ipAddr)
            if (!url || url === '') {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Tạo url thanh toán thất bại"
                }
            }
            return {
                status: HttpStatus.OK,
                message: 'Tạo url thanh toán thành công',
                data: url
            }
        }
        catch (error) {
            console.log(error)
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi hệ thống"
            }
        }
    }

    @MessagePattern(PaymentCommand.ZALOPAY_CREATE_ORDER)
    async zalopayCreateOrder(data: any) {
        try {
            const {orderId, orderInfo, appuser, items} = data
            const responseData = await this.paymenService.zalopayCreateOrder(
                orderId,
                orderInfo,
                appuser,
                items,
            )
            if (!responseData) {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Tạo url thanh toán thất bại"
                }
            }
            return {
                status: HttpStatus.OK,
                message: 'Tạo url thanh toán thành công',
                data: responseData
            }

        }
        catch(error) {
            console.log(error)
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi hệ thống"
            }
        }
    }
}
