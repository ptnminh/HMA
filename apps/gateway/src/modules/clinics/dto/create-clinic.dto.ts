import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { IClinics } from '../interface';

export class CreateClinicDto {
  @IsString()
  @ApiProperty({ example: 'Clinic 1', description: 'The name of the Clinic' })
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'The email of the Clinic',
  })
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('VN')
  @ApiProperty({
    example: '0123456789',
    description: 'The phone number of the Clinic',
  })
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @ApiProperty({ example: 'Address', description: 'The address of the Clinic' })
  address: string;
}

export class CreateClinicResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: {
      id: '1',
      name: 'Clinic 1',
      email: 'email@gmail.com',
      phoneNumber: '0123456789',
      address: 'Address',
      isActive: true,
      createdAt: '2021-09-27T07:45:16.000Z',
      updatedAt: '2021-09-27T07:45:16.000Z',
    },
    nullable: false,
  })
  data: IClinics;
  @ApiProperty({ example: 'Tạo Clinic thành công.', nullable: true })
  message: { [key: string]: any };
}
