import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePatientReceptionDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  appointmentId: number;
}

export class UpdateMedicalRecordDto {
  @ApiProperty({
    example: 170,
    description: 'Result of the service',
    required: false,
  })
  serviceResult?: string;

  @ApiProperty({
    example: 170,
    required: false,
  })
  @IsOptional()
  height?: number;

  @ApiProperty({
    example: 70,
    required: false,
  })
  @IsOptional()
  weight?: number;

  @ApiProperty({
    example: 120,
    required: false,
  })
  @IsOptional()
  bloodPressure?: number;

  @ApiProperty({
    example: 37.5,
    required: false,
  })
  @IsOptional()
  temperature?: number;

  @ApiProperty({
    example: 'Headache',
    required: false,
  })
  @IsOptional()
  diagnose?: string;

  @ApiProperty({
    example: 'Normal',
    required: false,
  })
  result?: string;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  examinationStatus?: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  paymentStatus?: number;

  @ApiProperty({
    example: 'Some notes',
    required: false,
  })
  @IsOptional()
  note?: string;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  patientId?: number;

  @ApiProperty({
    example: 'clinicId',
    required: false,
  })
  @IsOptional()
  clinicId?: string;

  @ApiProperty({
    example: 'doctorId',
    required: false,
  })
  @IsOptional()
  doctorId?: number;
}

export class UpdateMedicalRecordServiceDto {
  @ApiProperty({
    example: 'Service result',
  })
  @IsOptional()
  @IsNumber()
  serviceResult?: string;

  @ApiProperty({
    example: 'Code',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;
}

export class CreateMedicalRequestServiceDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  clinicServiceId: number;

  @ApiProperty({
    example: 'Service name',
  })
  @IsNotEmpty()
  @IsString()
  serviceName: string;
}
