import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalSupplierDto {
  @ApiProperty({ example: 'Supplier Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Supplier Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Supplier Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Supplier Phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'supplier@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ example: 'clinic_id' })
  @IsString()
  @IsOptional()
  clinicId: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: '2022-01-01' })
  @IsOptional()
  @IsString()
  expiredAt?: Date;
}

export class CreateMedicalSupplierResponse {
  @ApiProperty({ example: 'true', type: Boolean, required: false })
  status: boolean;
  @ApiProperty({
    example: {
      id: '1',
      name: 'Supplier Name',
      description: 'Supplier Description',
      address: 'Supplier Address',
      phone: 'Supplier Phone',
      email: 'supplier@example.com',
      stock: 10,
      clinicId: 'clinic_id',
      categoryId: 1,
      expiredAt: '2022-01-01',
    },
    nullable: false,
  })
  data: CreateMedicalSupplierDto;
  @ApiProperty({
    example: 'Tạo nhà cung cấp thành công!',
    nullable: true,
  })
  message: { [key: string]: any };
}
export class UpdateMedicalSupplierDto {
  @ApiProperty({ example: 'Supplier Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Supplier Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Supplier Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Supplier Phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'supplier@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ example: 'clinic_id' })
  @IsOptional()
  @IsString()
  clinicId?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: '2022-01-01' })
  @IsOptional()
  @IsString()
  expiredAt?: Date;
}
