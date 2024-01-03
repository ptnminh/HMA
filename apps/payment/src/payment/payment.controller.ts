import { Controller, HttpStatus, Get, Req, Res, Inject } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MessagePattern, ClientProxy } from '@nestjs/microservices';
import { PaymentCommand } from './command';
import * as qs from 'qs';
import { firstValueFrom } from 'rxjs';
import * as randomstring from 'randomstring';
import { Console } from 'console';


@Controller('payment')
export class PaymentController {
    constructor(private paymenService: PaymentService,
        @Inject('CLINIC_SERVICE') private readonly clinicServiceClient: ClientProxy) {}


    @MessagePattern(PaymentCommand.CREATE_ORDER)
    async createPaymentUrl(data: any) {
        const {dto, ipAddr} = data;
        var paymentData = {
            clinicId: dto.clinicId,
            totalCost: dto.totalCost,
            returnUrl: dto.returnUrl,
            subscribePlanId: dto.subscribePlanId,
            provider: dto.provider
        }
        try {
            var responseData: any;
            if(dto.provider === "Zalopay") {
                paymentData.subscribePlanId += randomstring.generate({length: 1, charset: 'alphanumeric'})
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
                responseData = await this.paymenService.vnpayCreateOrder(ipAddr, paymentData.clinicId, paymentData.totalCost, paymentData.returnUrl, paymentData.subscribePlanId, paymentData.provider )
                if (responseData['orderurl'] === '') {
                    return {
                        status: HttpStatus.BAD_REQUEST,
                        message: "Tạo link thanh toán thất bại"
                    }
                }
            }
            const id = paymentData.subscribePlanId
            const subscription = await this.paymenService.findSubcriptionById(id)
            if (subscription) {
                const inputData = {
                    clinicId: subscription.clinicId,
                    subscribePlanId: subscription.id,
                    data: {
                        status: 4
                    }
                }
                await this.delayedUpdateSubcriptions(inputData)
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
                isMobile: data['isMobile']
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
                returnQuery.subscribePlanId = splitedString[1].substring(0, 36)
                if (data['vnp_TransactionStatus'] === '00') {
                    returnQuery.status = '1'
                }
                else {
                    returnQuery.status = '0'
                }
            }
            const subscribePlanId = returnQuery.subscribePlanId
            const subcription = await this.paymenService.findSubcriptionById(subscribePlanId)
            if (subcription ) {
                const clinicId = subcription.clinicId
                const data = {
                    status: (returnQuery.status === "1") ? 3:4
                }
                const response = await firstValueFrom(this.clinicServiceClient.send(PaymentCommand.UPDATE_SUBSCRIBE_PLAN, {
                    data,
                    clinicId,
                    subscribePlanId,
                }))
                if (response.status === false) {
                    return {
                        data: "update_false",
                        status: false,
                    }
                }
                returnQuery.clinicId = clinicId
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

    async updateSubcriptions(inputData: any) {
        try {
            const {data, clinicId, subscribePlanId} = inputData
            const subscription = await this.paymenService.findSubcriptionById(subscribePlanId)
            if (subscription.status !== 3 && subscription.status !== 4 && subscription.status !== 2) {
                const response = await firstValueFrom(this.clinicServiceClient.send(PaymentCommand.UPDATE_SUBSCRIBE_PLAN, {
                    data,
                    clinicId,
                    subscribePlanId,
                }))
                if (response.status === HttpStatus.OK) {
                    console.log("Updated Successfully")
                }
                else {
                    console.log(response.status)
                }    
            }
        }
        catch(error) {
            console.log(error)
        }
    }

    async delayedUpdateSubcriptions(inputData: any) {
        var update = async () => {
            await this.updateSubcriptions(inputData)
        }
        const timer = 15*60*1000
        setTimeout(update, timer)
    }

}
