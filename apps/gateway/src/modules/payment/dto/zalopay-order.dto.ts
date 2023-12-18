import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested, Min } from "class-validator";

export class ZalopayItem {

    @ApiProperty({example: 1})
    @IsNumber()
    @IsNotEmpty()
    itemid: number;

    @ApiProperty({example: 'Gói Vip'})
    @IsString()
    @IsNotEmpty()
    itemname: string;

    @ApiProperty({example: 10000})
    @Min(10000)
    @IsString()
    @IsNotEmpty()
    itemprice: number;

    @ApiProperty({example: 1})
    @Min(1)
    @IsNumber()
    @IsNotEmpty()
    itemquantity: number;
}

export class ZalopayOrderDto {
    @ApiProperty({example: 1})
    @IsNumber()
    @IsNotEmpty()
    orderId: number;

    @ApiProperty({example: "ZALOPAY - Thanh toán"})
    @IsString()
    @IsNotEmpty()
    orderInfo: string;

    @ApiProperty({example: "Demo User"})
    @IsString()
    @IsNotEmpty()
    appuser: string;

    @ApiProperty({
        type: ZalopayItem,
        isArray: true,
    })
    items: ZalopayItem[];
}