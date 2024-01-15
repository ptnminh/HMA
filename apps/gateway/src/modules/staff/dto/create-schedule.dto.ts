import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreeateScheduleDto {

    @ApiProperty({example: '2024-10-01 07:30'})
    @IsDateString()
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({example: '2024-10-01 16:00'})
    @IsDateString()
    @IsString()
    @IsNotEmpty()
    endTime: string;
}