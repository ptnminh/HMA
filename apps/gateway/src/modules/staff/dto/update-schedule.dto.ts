import { IsArray, IsNotEmpty, IsNumber, Min, Max, IsString, Matches, ValidateNested, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import {Type} from "class-transformer";

export class UpdateScheduleDto {


    @ApiProperty({example: '07:30'})
    @Matches(/^(2[0-3]|1?[0-9]|0?[1-9]):([0-5]?[0-9])$/)
    @IsString()
    @IsNotEmpty()
    startTime: string

    @ApiProperty({example: '16:30'})
    @Matches(/^(2[0-3]|1?[0-9]|0?[1-9]):([0-5]?[0-9])$/)
    @IsString()
    @IsNotEmpty()
    endTime: string

    @ApiProperty({example: 2})
    @Min(1)
    @Max(7)
    @IsNumber()
    @IsNotEmpty()
    day: number
}

export class ScheduleList {
    @ApiProperty({example: [
        {
            "startTime": "07:30",
            "endTime": "11:00",
            "day": 2,
        },
        {
            "startTime": "07:30",
            "endTime": "11:00",
            "day": 3,
        },
        {
            "startTime": "07:30",
            "endTime": "11:00",
            "day": 4,
        },
        {
            "startTime": "07:30",
            "endTime": "11:00",
            "day": 5,
        },
        {
            "startTime": "07:30",
            "endTime": "11:00",
            "day": 6,
        },
        {
            "startTime": "07:30",
            "endTime": "11:00",
            "day": 7,
        },
    ]})
    @IsOptional()
    @ValidateNested({each: true})
    @IsArray()
    @Type(() => UpdateScheduleDto)
    schedules: UpdateScheduleDto[]
}