import { Body, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as qs from 'qs';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import { paymentDto } from './dto/payment.dto';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class PaymentService {
    constructor(private pismaService: PrismaService) {}

    vnpayConfig = {
        terminald: process.env.VNPAY_TERMINAL_ID as string,
        secretKey: process.env.VNPAY_SECRET as string,
        url: process.env.VNPAY_URL as string
    }

    zalopayConfig = {
        appid: process.env.ZALOPAY_APPID as string,
        key1: process.env.ZALOPAY_KEY1 as string,
        key2: process.env.ZALOPAY_KEY2 as string,
    }

    sortObject(obj) {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj){
            if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }


    async vnpayCreateOrder (
        ipAddr: string,
        clinicId: string,
        totalCost: number,
        returnUrl: string,
        subscribePlanId: string,
        provider: string
        ) {
        var params = {}
        params['vnp_Amount'] = totalCost*100
        params['vnp_Command'] = 'pay'
        params['vnp_CreateDate'] = moment(new Date()).format('YYYYMMDDHHmmss')
        params['vnp_CurrCode'] = 'VND'
        params['vnp_IpAddr'] = ipAddr
        params['vnp_Locale'] = 'vn'
        params['vnp_OrderInfo'] = "VNPAY_THANH TOÁN_" +"_"+totalCost,
        params['vnp_OrderType'] =   'other'
        params['vnp_ReturnUrl'] = returnUrl,
        params['vnp_TxnRef'] = "CLINUS" + "_" + subscribePlanId + "_" + moment(new Date()).format('YYYYMMDDHHmmss')
        params['vnp_Version'] = '2.1.0'
        params['vnp_TmnCode'] = this.vnpayConfig.terminald
        if (provider === 'ATM') {
            params['vnp_BankCode'] = 'VNBANK'
        }
        else if (provider === 'InternationalCard') {
            params['vnp_BankCode'] = 'INTCARD'
        }
        params = this.sortObject(params)

        const signData = qs.stringify(params, {encode: false})
        const hmac = crypto.createHmac('sha512', this.vnpayConfig.secretKey)
        const sign = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
        params['vnp_SecureHash'] = sign;

        return this.vnpayConfig.url + '?' + qs.stringify(params, {encode: false})
    }

    async zalopayCreateOrder(
        clinicId: string,
        totalCost: number,
        returnUrl: string,
        subscribePlanId: string,
    ) {
        const items = [{
            itemid: clinicId,
            itemname: 'Clinic',
            itemprice: totalCost,
            itemquantity: 1, 
        }]
        var embededData = {
            'redirecturl': returnUrl
        }

        var totalCost = 0
        for (let item of items) {
            totalCost += item['itemprice'] * item['itemquantity']
        }

        const splitedString = subscribePlanId.split('-')
        var transid = moment(new Date()).format('YYMMDD') + "_"
        for(let str of splitedString) {
            transid += str
        }

        var order = {
            appid: this.zalopayConfig.appid,
            apptransid: transid,
            appuser: "DEMO",
            apptime: Date.now(),
            item: JSON.stringify(items),
            embeddata: JSON.stringify(embededData),
            amount: totalCost,
            description: "ZALOPAY_THANH TOÁN_" + subscribePlanId +"_"+totalCost,
            bankcode: "zalopayapp",
        }
        console.log(order)

        const signToken = order.appid + "|" + order.apptransid + "|" + order.appuser + "|" + order.amount + "|" + order.apptime + "|" + order.embeddata + "|" + order.item;
        console.log(signToken)

        order['mac'] = CryptoJS.HmacSHA256(signToken, this.zalopayConfig.key1)
        const res = await axios.post(process.env.ZALOPAY_ENDPOINT, null, {params: order})
        return res.data
    }

    async vnpayValidatedCallback(data: any) {
        var params = data
        var secureHash = params['vnp_SecureHash']
        delete(params['vnp_SecureHash'])
        delete(params['vnp_SecureHashType'])
        delete(params['body'])

        const signData = qs.stringify(params, {encode: false})
        const hmac = crypto.createHmac('sha512', this.vnpayConfig.secretKey)
        const sign = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

        if(sign === secureHash) {
            return true
        }
        else {
            return false
        }
    }

    async zalopayValidateCallback(data: any) {
        var reqBody = data['body']
        var reqMac = reqBody['mac']
        var reqData = reqBody['data']

        var macData = CryptoJS.HmacSHA256(reqData, this.zalopayConfig.key2).toString()
        console.log(reqMac)
        if(reqMac === macData) {
            return true
        } else {
            return false
        }
    }

    async handleVnpayCallback(data: any) {
        var returnQuery = {
            amount: '',
            clinicId: '',
            status: '',
        }
        if(data['amount']) {
            returnQuery.amount = data['amount']
            returnQuery.clinicId = data['apptransid'].substring(16, data['apptransid'].length)
            if (data['status'] === '1') {
                returnQuery.status = 'true'
            } else {
                returnQuery.status = 'false'
            }
        }
        return qs.stringify(data)
    }

    async handleZalopayCallback(data: any) {
        var returnQuery = {
            amount: '',
            clinicId: '',
            status: '',
        }
        if(data['amount']) {
            returnQuery.amount = data['amount']
            returnQuery.clinicId = data['apptransid'].substring(16, data['apptransid'].length)
            if (data['status'] === '1') {
                returnQuery.status = 'true'
            } else {
                returnQuery.status = 'false'
            }
        }
        return qs.stringify(data)
    }


    async findSubcriptionById(id: string) {
        return this.pismaService.subscriptions.findUnique({
            where: {
                id,
            }
        })
    }
 
}
