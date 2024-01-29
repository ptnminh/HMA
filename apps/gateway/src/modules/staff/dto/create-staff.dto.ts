import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateStaffDto {


  @ApiProperty({
    example: 'Tim mạch',
  })
  @IsString()
  @IsOptional()
  specialize?: string;

  @ApiProperty({
    example: 1,
    description: 'Years of experience. Minimum required: 0',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  experience: number;

  @ApiProperty({
    example: [1, 2, 4],
    description: 'The list contains clinic service id',
  })
  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @IsOptional()
  services?: number[];
}

export class CreateAppoimentDto {
  @ApiProperty({ example: '07:30' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '7:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 'description' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 11 })
  @IsNotEmpty()
  doctorId: number;

  @ApiProperty({ example: '01046db1-154f-41af-a2c0-61c6669a3e23' })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: '01046db1-154f-41af-a2c0-61c6669a3e23' })
  @IsNotEmpty()
  clinicId: string;

  @ApiProperty({ example: '2021-09-01' })
  @IsNotEmpty()
  date: string;
}

export class UpdateAppointmentDto {
  @ApiProperty({ example: '07:30' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ example: '7:00' })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({ example: 'description' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 11 })
  @IsOptional()
  doctorId?: number;

  @ApiProperty({ example: '01046db1-154f-41af-a2c0-61c6669a3e23' })
  @IsOptional()
  patientId?: string;

  @ApiProperty({ example: '01046db1-154f-41af-a2c0-61c6669a3e23' })
  @IsOptional()
  clinicId?: string;

  @ApiProperty({ example: '2021-09-01' })
  @IsOptional()
  date?: string;
}
