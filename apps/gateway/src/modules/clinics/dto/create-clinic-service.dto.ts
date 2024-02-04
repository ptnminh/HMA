import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class CreateClinicServiceDto {
    @ApiProperty({
        example: "Clinic service 1",
        description: "The name of clinic service"
    })
    @IsString()
    @IsNotEmpty()
    serviceName: string;

    @ApiProperty({
        example: 500000,
        description: "The price of clinic service"
    })
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({
        example: "Description",
        description: "The description for clinic service"
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({example: 1})
    @IsNumber()
    @IsOptional()
    categoryId?: number
}