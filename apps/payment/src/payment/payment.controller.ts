import { Controller, HttpStatus, Get, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MessagePattern } from '@nestjs/microservices';
import { PaymentCommand } from './command';
import { paymentDto } from './dto';
import { Request, Response } from 'express';
import * as qs from 'qs';


@Controller('payment')
export class PaymentController {
    constructor(private paymenService: PaymentService) {}

    @MessagePattern(PaymentCommand.CREATE_ORDER)
    async createPaymentUrl(data: any) {
        const {dto, ipAddr} = data;
        console.log(dto)
        const paymentData = {
            clinicId: dto.clinicId,
            totalCost: dto.totalCost,
            returnUrl: dto.returnUrl,
        }
        try {
            var responseData: any;
            if(dto.provider === "Zalopay") {
                responseData = await this.paymenService.zalopayCreateOrder(paymentData.clinicId, paymentData.totalCost, paymentData.returnUrl)
                if (responseData['orderurl'] === '') {
                    return {
                        status: HttpStatus.BAD_REQUEST,
                        message: "Tạo link thanh toán thất bại"
                    }
                }
                responseData = responseData['orderurl']
            }
            else {
                responseData = await this.paymenService.vnpayCreateOrder(ipAddr, paymentData.clinicId, paymentData.totalCost, paymentData.returnUrl)
                if (responseData['orderurl'] === '') {
                    return {
                        status: HttpStatus.BAD_REQUEST,
                        message: "Tạo link thanh toán thất bại"
                    }
                }
            }
            return {
                status: HttpStatus.OK,
                message: "Tạo link thanh toán thành công",
                data: responseData
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

    @MessagePattern(PaymentCommand.HANDLE_CALLBACK)
    async handleCallback(data: any) {
        try {
            var returnQuery = {
                amount: '',
                clinicId: '',
                status: '',
            }
            if(data['amount'] && this.paymenService.zalopayValidateCallback(data)) {
                returnQuery.amount = data['amount']
                returnQuery.clinicId = data['apptransid'].substring(16, data['apptransid'].length)
                if (data['status'] === '1') {
                    returnQuery.status = '1'
                } else {
                    returnQuery.status = '0'
                }
            }
            else if (data['vnp_Amount'] && this.paymenService.vnpayValidatedCallback(data)) {
                returnQuery.amount = (parseInt(data['vnp_Amount'])/100).toString()
                returnQuery.clinicId = data['vnp_TxnRef']
                if (data['vnp_TransactionStatus'] === '00') {
                    returnQuery.status = '1'
                }
                else {
                    returnQuery.status = '0'
                }
            }
            console.log(returnQuery)
            return {
                status: true,
                data: qs.stringify(returnQuery)
            }
        }
        catch (error) {
            console.log(error)
            return {
                status: false,
                data: 'error',
            }
        }
    }

}
