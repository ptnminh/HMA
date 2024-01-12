import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreeateScheduleDto {

    @ApiProperty({example: '2024-10-01T07:30:00.000Z'})
    @IsDateString()
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({example: '2024-10-01T16:00:00.000Z'})
    @IsDateString()
    @IsString()
    @IsNotEmpty()
    endTime: string;
}