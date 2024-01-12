import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateStaffDto {

    @ApiProperty({example: 1})
    @IsNumber()
    @IsNotEmpty()
    memberId: number
}