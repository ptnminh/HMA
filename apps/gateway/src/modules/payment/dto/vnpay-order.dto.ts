import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class VnpayOrderDto {
    @ApiProperty({example: 1})
    @IsNumber()
    @IsNotEmpty()
    orderId: number;

    @ApiProperty({example: 100000})
    @IsNumber()
    @IsNotEmpty()
    @Min(10000)
    totalCost: number;

    @ApiProperty({example: "Zalopay - Thanh toán đơn hàng ID 1"})
    @IsString()
    @IsNotEmpty()
    orderInfo: string;

    @ApiProperty({example: "other"})
    @IsString()
    @IsOptional()
    orderType?: string;
}