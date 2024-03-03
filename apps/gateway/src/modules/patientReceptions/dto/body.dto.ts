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

class Service {
  @ApiProperty({
    example: 38,
  })
  @IsNotEmpty()
  @IsNumber()
  clinicServiceId: number;

  @ApiProperty({
    example: 'Tư vấn tâm lý',
  })
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @ApiProperty({
    example: 235000,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  doctorId: number;
}

export class CreatePatientReception2Dto {
  @ApiProperty({
    example: 'ed8b694b-28e3-47e3-beaa-25cdf8830ef1',
    required: true,
  })
  @IsNotEmpty()
  clinicId: string;

  @ApiProperty({
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  patientId: number;

  @ApiProperty({
    example: 81,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  doctorId: number;

  @ApiProperty({
    example: 'đau đầu',
    required: true,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    type: [Service],
    required: true,
  })
  @IsNotEmpty()
  services: Service[];
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
    example: 1,
    required: false,
  })
  @IsOptional()
  doctorId?: number;
}

export class UpdateMedicalRecordServiceDto {
  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  clinicServiceId?: number;

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  doctorId?: number;

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  medicalRecordId?: number;

  @ApiProperty({
    example: 5555,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({
    example: 'Service name',
  })
  @IsOptional()
  @IsString()
  serviceName?: string;

  @ApiProperty({
    example: 'Service result',
  })
  @IsOptional()
  @IsString()
  serviceResult?: string;

  @ApiProperty({
    example: 'clinicId',
  })
  @IsOptional()
  @IsString()
  clinicId?: string;
}

export class CreateMedicalRecordServiceDto {
  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  clinicServiceId?: number;

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  doctorId?: number;

  @ApiProperty({
    example: 5555,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({
    example: 'Service name',
  })
  @IsOptional()
  @IsString()
  serviceName?: string;

  @ApiProperty({
    example: 'Service result',
  })
  @IsOptional()
  @IsString()
  serviceResult?: string;

  @ApiProperty({
    example: 'clinicId',
  })
  @IsOptional()
  @IsString()
  clinicId?: string;
}

export class CreateMedicalRequestServiceDto {
  @ApiProperty({
    example: 'Service name',
  })
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @ApiProperty({
    example: 'Service result',
  })
  @IsOptional()
  @IsString()
  serviceResult?: string;
}
export class UpdateMedicalRequestServiceDto {
  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  medicalRecordId?: number;

  @ApiProperty({
    example: 'Service name',
  })
  @IsOptional()
  @IsString()
  serviceName?: string;

  @ApiProperty({
    example: 'Service result',
  })
  @IsOptional()
  @IsString()
  serviceResult?: string;
}

class Prescription {
  @ApiProperty({
    example: 'Paracetamol',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  medicineName: string;

  @ApiProperty({
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  dosage?: number;

  @ApiProperty({
    example: 'mg',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    example: '7 days',
    required: false,
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({
    example: 'Morning and evening',
    required: false,
  })
  @IsOptional()
  @IsString()
  usingTime?: string;

  @ApiProperty({
    example: '4 hours',
    required: false,
  })
  @IsOptional()
  @IsString()
  doseInterval?: string;

  @ApiProperty({
    example: 'Take with food',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdatePrescriptionToMedicalRecordDto {
  @ApiProperty({
    type: [Prescription],
    required: true,
  })
  @IsNotEmpty()
  prescriptions: Prescription[];
}

export class UpdateInvoiceDto {
  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cashierId?: number;
}

export class MedicalRecordUsingSupplies {
  @ApiProperty({
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  medicalSupplyId: number;

  @ApiProperty({
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateMedicalRecordUsingSuppliesDto {
  @ApiProperty({
    type: [MedicalRecordUsingSupplies],
    required: true,
  })
  @IsNotEmpty()
  supplies: MedicalRecordUsingSupplies[];
}

export class UpdateMedicalUsingSuppliesDto {
  @ApiProperty({
    required: true,
    example: 1,
  })
  @IsNotEmpty()
  quantity: number;
}
