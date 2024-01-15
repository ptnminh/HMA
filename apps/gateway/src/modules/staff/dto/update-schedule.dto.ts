import { IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger";

export class UpdateScheduleDto {


    @ApiProperty({example: '2024-10-01 07:30'})
    @IsString()
    @IsOptional()
    startTime?: string

    @ApiProperty({example: '2024-10-01 16:30'})
    @IsString()
    @IsOptional()
    endTime?: string
}