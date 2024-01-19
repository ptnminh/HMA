import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  memberId: number;
}

export class CreateAppoimentDto {
  @ApiProperty({ example: '7:00' })
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
}
