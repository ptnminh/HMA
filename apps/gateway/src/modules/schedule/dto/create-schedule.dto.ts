import { ApiProperty } from "@nestjs/swagger";

export class createScheduleDto {
    @ApiProperty({example: 1})
    day: number;

    @ApiProperty({example: "07:00:00"})
    startTime: string;

    @ApiProperty({example: "16:00:00"})
    endTime: string
}