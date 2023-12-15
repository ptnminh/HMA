import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { IClinics } from '../interface';
import { Transform } from 'class-transformer';

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
  phone: string;

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
      phone: '0123456789',
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

export class ListClinicResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: [
      {
        id: '1',
        name: 'Clinic 1',
        email: 'email@gmail.com',
        phone: '0123456789',
        address: 'Address',
        isActive: true,
        createdAt: '2021-09-27T07:45:16.000Z',
        updatedAt: '2021-09-27T07:45:16.000Z',
      },
    ],
    nullable: false,
  })
  data: IClinics[];
  @ApiProperty({ example: 'Lấy danh sách clinics thành công.', nullable: true })
  message: { [key: string]: any };
}

export class SubcribePlanDTO {
  @IsString()
  @ApiProperty({
    example: '2021-09-27T07:45:16.000Z',
    description: 'Expired time',
  })
  @Transform(({ value }) => new Date(value).toISOString())
  expiredAt: string;
}
export class SubcribePlanResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({ example: 'Subcribe plan thành công.', nullable: true })
  message: { [key: string]: any };
}

export class GetUsersInClinicResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: [
      {
        id: '1',
        firstName: 'minh',
        email: 'minhphan113@gmail.com',
        roleId: 1,
        lastName: 'phan',
        isOwer: true,
        role: {
          id: 1,
          name: 'Admin',
        },
      },
    ],
    nullable: false,
  })
  data: any[];
  @ApiProperty({ example: 'Lấy danh sách user thành công.', nullable: true })
  message: { [key: string]: any };
}
