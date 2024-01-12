import { IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger";

export class UpdateScheduleDto {


    @ApiProperty({example: '2024-10-01T07:30:00.000Z'})
    @IsString()
    @IsOptional()
    startTime?: string

    @ApiProperty({example: '2024-10-01T07:30:00.000Z'})
    @IsString()
    @IsOptional()
    endTime?: string
}