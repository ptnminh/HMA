import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalSupplierDto {
  @ApiProperty({ example: 'Medicine Name' })
  @IsString()
  medicineName: string;

  @ApiProperty({ example: 'Medical Supply Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Vendor Name' })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiProperty({ example: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: 'clinicId' })
  @IsOptional()
  @IsString()
  clinicId?: string;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ example: 'Unit' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: 1, description: 'Không có thì ko gửi lên' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: '2022-01-01' })
  @IsOptional()
  @IsString()
  expiry?: Date;
}

export class CreateMedicalSupplierResponse {
  @ApiProperty({ example: 'true', type: Boolean, required: false })
  status: boolean;
  @ApiProperty({
    example: {
      id: '1',
      medicineName: 'Supply Name',
      description: 'Supply Description',
      stock: 10,
      categoryId: 1,
      expiredAt: '2022-01-01',
    },
    nullable: false,
  })
  data: CreateMedicalSupplierDto;
  @ApiProperty({
    example: 'Tạo Medical Supply thành công!',
    nullable: true,
  })
  message: { [key: string]: any };
}
export class UpdateMedicalSupplierDto {
  @ApiProperty({ example: 'Medicine Name' })
  @IsString()
  @IsOptional()
  medicineName: string;

  @ApiProperty({ example: 'Medical Supply Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Vendor Name' })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiProperty({ example: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: 'clinicId' })
  @IsOptional()
  @IsString()
  clinicId?: string;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ example: 'Unit' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: '2022-01-01' })
  @IsOptional()
  @IsString()
  expiry?: Date;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isDisabled?: boolean;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
