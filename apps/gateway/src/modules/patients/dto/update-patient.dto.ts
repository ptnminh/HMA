import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class updatePatientDto {

    @ApiProperty({example: "A"})
    @IsString()
    @IsOptional()
    bloodGroup?: String;

    @ApiProperty({example: "anamnesis"})
    @IsString()
    @IsOptional()
    anamnesis?: String;

    @ApiProperty({example: "idCard"})
    @IsString()
    @IsOptional()
    idCard?: String;

    @ApiProperty({example: "healthInsurance"})
    @IsString()
    @IsOptional()
    healthInsuranceCode?: String;
}