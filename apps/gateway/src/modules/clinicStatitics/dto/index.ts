import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetClinicsQueryDto {
  @ApiProperty({ required: true, example: '60f3e3e3e3e3e3e3e3e3e3e3' })
  @IsString()
  @IsNotEmpty()
  clinicId: string;

  @ApiProperty({ required: true, example: '2024-02-10' })
  @IsString()
  @IsOptional()
  startDate: string;

  @ApiProperty({ required: true, example: '2024-02-17' })
  @IsString()
  @IsOptional()
  endDate: string;
}

export class GetClinicsByDateQueryDto {
  @ApiProperty({ required: true, example: '60f3e3e3e3e3e3e3e3e3e3e3' })
  @IsString()
  @IsNotEmpty()
  clinicId: string;

  @ApiProperty({ required: true, example: '2024-02-10' })
  @IsString()
  @IsOptional()
  startDate: string;

  @ApiProperty({ required: true, example: '2024-02-17' })
  @IsString()
  @IsOptional()
  endDate: string;
}

export class GetAdminStatiticsQueryDto {
  @ApiProperty({ required: true, example: '2024-02-10' })
  @IsString()
  @IsOptional()
  startDate: string;

  @ApiProperty({ required: true, example: '2024-02-17' })
  @IsString()
  @IsOptional()
  endDate: string;
}
