import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator';
class UserInfo {
  @ApiProperty({
    example: 'email@gmail.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'https://www.google.com',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  gender?: number;

  @ApiProperty({
    example: '0987654321',
  })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: '2021-09-01',
  })
  @IsOptional()
  @IsString()
  birthday?: string;
}
export class CreateStaffDto {
  @ApiProperty({
    example: 'Tim mạch',
  })
  @IsString()
  @IsOptional()
  specialize?: string;

  @ApiProperty({
    example: 'userId',
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: 'clinicId',
  })
  @IsString()
  @IsOptional()
  clinicId?: string;

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  roleId?: number;

  @ApiProperty({
    example: 1,
    description: 'Years of experience. Minimum required: 0',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  experience: number;

  @ApiProperty({
    example: [1, 2, 4],
    description: 'The list contains clinic service id',
  })
  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @IsOptional()
  services?: number[];

  @ApiProperty({
    type: UserInfo,
    example: {
      email: 'email@gmail.com',
      avatar: 'https://www.google.com',
      firstName: 'John',
      lastName: 'Doe',
      gender: 0,
      phone: '0987654321',
      address: 'address',
      birthday: '2021-09-01',
    },
  })
  @IsOptional()
  userInfo?: UserInfo;
}

export class CreateAppoimentDto {
  @ApiProperty({ example: '07:30' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '7:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 'description' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 11 })
  @IsNotEmpty()
  doctorId: number;

  @ApiProperty({ example: '01046db1-154f-41af-a2c0-61c6669a3e23' })
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: '01046db1-154f-41af-a2c0-61c6669a3e23' })
  @IsNotEmpty()
  clinicId: string;

  @ApiProperty({ example: '2021-09-01' })
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  serviceId?: number;
}

export class UpdateAppointmentDto {
  @ApiProperty({ example: '07:30' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ example: '7:00' })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({ example: 'description' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 11 })
  @IsOptional()
  doctorId?: number;

  @ApiProperty({ example: '01046db1-154f-41af-a2c0-61c6669a3e23' })
  @IsOptional()
  patientId?: string;

  @ApiProperty({ example: '01046db1-154f-41af-a2c0-61c6669a3e23' })
  @IsOptional()
  clinicId?: string;

  @ApiProperty({ example: '2021-09-01' })
  @IsOptional()
  date?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  serviceId?: number;
}
