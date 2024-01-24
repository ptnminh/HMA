import { IsNotEmpty, IsDateString } from 'class-validator';

export class FindFreeAppointmentByStaffIdQueryDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;
}
