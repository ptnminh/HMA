import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';


export class paymentDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({example: "1"})
    clinicId: string;
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
} 