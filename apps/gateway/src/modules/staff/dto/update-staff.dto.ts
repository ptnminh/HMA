import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsDate,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
  IsEmail,
} from 'class-validator';

class UserInfo {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Clinic' })
  firstName?: String;

  @ApiProperty({ example: 'Test User' })
  @IsString()
  @IsOptional()
  lastName?: String;

  @ApiProperty({ example: 0 })
  @IsIn([0, 1])
  @IsOptional()
  gender?: number;

  @ApiProperty({ example: '01/01/2001' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  birthday?: Date;

  @ApiProperty({ example: 'Nguyễn Văn Cứ, P5, TP.Hồ Chí Minh' })
  @IsString()
  @IsOptional()
  address?: String;

  @ApiProperty({ example: '84926251488' })
  @IsPhoneNumber('VN')
  @IsOptional()
  phone?: String;

  @ApiProperty({ example: 'avatar' })
  @IsString()
  @IsOptional()
  avatar?: String;

  @ApiProperty({ example: 'example@email.com' })
  @IsEmail()
  @IsOptional()
  email?: String;
}

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Description' })
  description?: string;

  @ApiProperty({
    example: 'Tim mạch',
  })
  @IsString()
  @IsOptional()
  specialize?: string;

  @ApiProperty({
    example: 1,
    description: 'Years of experience. Minimum required: 0',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  experience: number;

  @ApiProperty({
    example: 1,
    description: 'The role id of the staff',
  })
  @IsOptional()
  @IsNumber()
  roleId?: number;

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
