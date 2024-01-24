import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';

export class FindFreeAppointmentByStaffIdQueryDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    required: false,
    example: '2021-09-01',
  })
  date: string;
}
