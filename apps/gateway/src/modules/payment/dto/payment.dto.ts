import { ApiProperty } from "@nestjs/swagger";

export class paymentDto {
    @ApiProperty({example: "1"})
    clinicId: string;
    @ApiProperty({example: 20000})
    totalCost: number;
    @ApiProperty({example: "Zalopay"})
    provider: string;
    returnUrl?: string;
} 