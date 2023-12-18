import { Injectable } from '@nestjs/common';
import { VnpayOrderDto } from 'src/payment/dto';
import * as moment from 'moment';
import * as qs from 'qs';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';


@Injectable()
export class PaymentService {

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

    async vnpayCreateOrder (dto: VnpayOrderDto, ipAddr: string) {
        var params = {}
        params['vnp_Amount'] = dto.totalCost*100
        params['vnp_Command'] = 'pay'
        params['vnp_CreateDate'] = moment(new Date()).format('YYYYMMDDHHmmss')
        params['vnp_CurrCode'] = 'VND'
        params['vnp_IpAddr'] = ipAddr
        params['vnp_Locale'] = 'vn'
        params['vnp_OrderInfo'] = dto.orderInfo
        params['vnp_OrderType'] =   dto.orderType
        params['vnp_ReturnUrl'] = process.env.FRONTEND_URL + '/vnpay/return'
        params['vnp_TxnRef'] = dto.orderId
        params['vnp_Version'] = '2.1.0'
        params['vnp_TmnCode'] = this.vnpayConfig.terminald

        params = this.sortObject(params)

        const signData = qs.stringify(params, {encode: false})
        const hmac = crypto.createHmac('sha512', this.vnpayConfig.secretKey)
        const sign = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
        params['vnp_SecureHash'] = sign;

        return this.vnpayConfig.url + '?' + qs.stringify(params, {encode: false})
    }

    async zalopayCreateOrder(
        orderId: number,
        orderInfo: string,
        appuser: string,
        items: []
    ) {


        var embededData = {
            "prefer_payment_method": [],
            "redirecturl": "http://localhost:5173/zalopay/return"
        }
        console.log(items)

        var totalCost = 0
        for (let item of items) {
            totalCost += item['itemprice'] * item['itemquantity']
        }

        var order = {
            appid: this.zalopayConfig.appid,
            apptransid: moment(new Date()).format('YYMMDD') + "_" + this.zalopayConfig.appid + orderId,
            appuser: appuser,
            apptime: Date.now(),
            item: JSON.stringify(items),
            embeddata: JSON.stringify(embededData),
            amount: totalCost,
            description: orderInfo,
            bankcode: "",
        }
        console.log(order)

        const signToken = order.appid + "|" + order.apptransid + "|" + order.appuser + "|" + order.amount + "|" + order.apptime + "|" + order.embeddata + "|" + order.item;
        console.log(signToken)

        order['mac'] = CryptoJS.HmacSHA256(signToken, this.zalopayConfig.key1)
        const res = await axios.post(process.env.ZALOPAY_ENDPOINT, null, {params: order})
        return res.data
    }

}
