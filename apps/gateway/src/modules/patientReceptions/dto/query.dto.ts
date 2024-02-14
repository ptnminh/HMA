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
}
