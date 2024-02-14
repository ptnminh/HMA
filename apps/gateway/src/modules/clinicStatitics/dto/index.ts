import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetClinicsQueryDto {
  @ApiProperty({ required: true, example: '60f3e3e3e3e3e3e3e3e3e3e3' })
  @IsString()
  @IsNotEmpty()
  clinicId: string;

  @ApiProperty({ required: false, example: '2024-02-10' })
  @IsString()
  @IsOptional()
  date: string;

  @ApiProperty({ required: false, example: 7 })
  @IsString()
  @IsOptional()
  days: string;
}
