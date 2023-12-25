import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';


export class paymentDto {
    clinicId?: string;
    

    @Min(20000)
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({example: 20000})
    totalCost: number;


    @IsString()
    @IsNotEmpty()
    @IsIn(['Zalopay', 'Vnpay', 'ATM', "InternationalCard"])
    @ApiProperty({example: "Zalopay"})
    provider: string;

    returnUrl?: string;


    @IsNotEmpty()
    @IsString()
    @ApiProperty({example: "9d0df7a5-5486-43b4-9957-d60ef8b1663f"})
    subscribePlanId: string;

} 