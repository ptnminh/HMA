import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateStaffDto {

    @ApiProperty({example: 1})
    @IsNumber()
    @IsNotEmpty()
    memberId: number
}