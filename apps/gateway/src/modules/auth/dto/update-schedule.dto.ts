import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class ScheduleDto{


    @IsOptional()
    @IsNumber()
    @ApiProperty({example: 1})
    day?: number;

    @IsOptional()
    @IsString()
    @ApiProperty({example: "07:00:00"})
    startTime?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({example: "16:00:00"})
    endTime?: string

}