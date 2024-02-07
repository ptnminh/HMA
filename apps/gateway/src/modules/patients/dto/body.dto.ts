import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UserInfo {
  @ApiProperty({
    example: 'email@gmail.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

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
}

export class CreatePatientDto {
  @ApiProperty({ example: 'A+' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiProperty({ example: 'Some anamnesis' })
  @IsString()
  @IsOptional()
  anamnesis?: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsOptional()
  idCard?: string;

  @ApiProperty({ example: 'ABC123' })
  @IsString()
  @IsOptional()
  healthInsuranceCode?: string;

  @ApiProperty({ example: 'cb0382a0-0b11-4dab-bfbb-a5902da1d9f4' })
  @IsString()
  @IsOptional()
  clinicId?: string;

  @ApiProperty({ example: 'user-id' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    type: UserInfo,
    example: {
      email: 'email@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
      gender: 0,
      address: 'address',
    },
  })
  @IsOptional()
  userInfo?: UserInfo;
}
