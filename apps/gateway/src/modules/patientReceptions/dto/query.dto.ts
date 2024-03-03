import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryGetListMedicalRecordDto {
  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  clinicId?: string;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  patientId?: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  doctorId?: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  paymentStatus?: number;

  @ApiProperty({
    example: "1b258a1a-31e1-4c11-8add-9cc19c7b38f9",
    required: false,
  })
  @IsOptional()
  puid?: string; 
}
