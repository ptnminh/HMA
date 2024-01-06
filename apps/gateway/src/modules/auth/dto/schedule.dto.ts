import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class ScheduleDto{


    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({example: 1})
    day: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({example: "07:00:00"})
    startTime: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({example: "16:00:00"})
    endTime: string

}