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
    @IsIn(['Zalopay', 'Vnpay'])
    @ApiProperty({example: "Zalopay"})
    provider: string;

    returnUrl?: string;


    @IsNotEmpty()
    @IsString()
    @ApiProperty({example: "0a585195-c703-4560-a8d8-eb122192f78b"})
    subscribePlanId: string;

} 