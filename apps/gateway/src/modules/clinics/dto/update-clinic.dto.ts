import { PartialType } from '@nestjs/mapped-types';
import { CreateClinicDto } from './create-clinic.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IClinics } from '../interface';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateClinicDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Clinic 1', description: 'The name of the Clinic' })
  name: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'The email of the Clinic',
  })
  email: string;

  @IsPhoneNumber('VN')
  @IsOptional()
  @ApiProperty({
    example: '0123456789',
    description: 'The phone number of the Clinic',
  })
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Address', description: 'The address of the Clinic' })
  address: string;

  @IsString()
  @ApiProperty({
    example: 'logo.png',
    description: 'The logo of the Clinic',
  })
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Description',
    description: 'The description of the Clinic',
  })
  description?: string;
}

export class UpdateClinicResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: {
      id: '1',
      name: 'Clinic 1',
      email: 'email@gmail.com',
      phone: '0123456789',
      address: 'Address',
      isActive: true,
      createdAt: '2021-09-27T07:45:16.000Z',
      updatedAt: '2021-09-27T07:45:16.000Z',
    },
    nullable: false,
  })
  data: IClinics;
  @ApiProperty({ example: 'Cập nhật Clinic thành công.', nullable: true })
  message: { [key: string]: any };
}
