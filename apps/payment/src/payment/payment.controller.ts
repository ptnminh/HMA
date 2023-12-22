import { Controller, HttpStatus, Get, Req, Res, Inject } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MessagePattern, ClientProxy } from '@nestjs/microservices';
import { PaymentCommand } from './command';
import { paymentDto } from './dto';
import { Request, Response } from 'express';
import * as qs from 'qs';
import { first, firstValueFrom } from 'rxjs';
import { Prisma } from '@prisma/client';
import { UpdateSubcribePlanDTO } from './dto/updateSubcriptio.dto';


@Controller('payment')
export class PaymentController {
    constructor(private paymenService: PaymentService,
        @Inject('CLINIC_SERVICE') private readonly clinicServiceClient: ClientProxy) {}


    @MessagePattern(PaymentCommand.CREATE_ORDER)
    async createPaymentUrl(data: any) {
        const {dto, ipAddr} = data;
        console.log(dto)
        const paymentData = {
            clinicId: dto.clinicId,
            totalCost: dto.totalCost,
            returnUrl: dto.returnUrl,
            subscribePlanId: dto.subscribePlanId,
        }
        try {
            var responseData: any;
            if(dto.provider === "Zalopay") {
                responseData = await this.paymenService.zalopayCreateOrder(paymentData.clinicId, paymentData.totalCost, paymentData.returnUrl, paymentData.subscribePlanId)
                if (responseData['orderurl'] === '') {
                    return {
                        status: HttpStatus.BAD_REQUEST,
                        message: "Tạo link thanh toán thất bại"
                    }
                }
                responseData = responseData['orderurl']
            }
            else {
                responseData = await this.paymenService.vnpayCreateOrder(ipAddr, paymentData.clinicId, paymentData.totalCost, paymentData.returnUrl, paymentData.subscribePlanId)
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
                subscribePlanId: '',
            }
            if(data['amount'] && this.paymenService.zalopayValidateCallback(data)) {
                returnQuery.amount = data['amount']
                var str: string = data['apptransid']
                var splitedString = str.split("_")
                returnQuery.subscribePlanId = splitedString[1].substring(0,8)
                + '-' + splitedString[1].substring(8,12)
                + '-' + splitedString[1].substring(12, 16)
                + '-' + splitedString[1].substring(16, 20)
                + '-' + splitedString[1].substring(20, 32)
                if (data['status'] === '1') {
                    returnQuery.status = '1'
                } else {
                    returnQuery.status = '0'
                }
            }
            else if (data['vnp_Amount'] && this.paymenService.vnpayValidatedCallback(data)) {
                returnQuery.amount = (parseInt(data['vnp_Amount'])/100).toString()
                var str: string = data['vnp_TxnRef']
                var splitedString = str.split("_")
                returnQuery.subscribePlanId = splitedString[1]
                if (data['vnp_TransactionStatus'] === '00') {
                    returnQuery.status = '1'
                }
                else {
                    returnQuery.status = '0'
                }
            }
            const subscribePlanId = returnQuery.subscribePlanId
            const subcription = await this.paymenService.findSubcriptionById(subscribePlanId)
            if (subcription) {
                returnQuery.clinicId = subcription.clinicId
            }
            if (returnQuery.status === '1' && subcription ) {
                const clinicId = subcription.clinicId
                const data: UpdateSubcribePlanDTO = {
                    status: 3
                }
                const response = await firstValueFrom(this.clinicServiceClient.send(PaymentCommand.UPDATE_SUBSCRIBE_PLAN, {
                    data,
                    clinicId,
                    subscribePlanId,
                }))
                if (response.status === false) {
                    return {
                        data: "update-false",
                        status: false,
                    }
                }
                delete(returnQuery.subscribePlanId)
            }
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
