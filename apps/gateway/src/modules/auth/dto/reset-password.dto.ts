import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty,  IsString, IsEmail } from 'class-validator';

export class ChangePasswordDto { 
  @ApiProperty({ example: '92803cf0-abda-4282-ad82-772d7c6af0c1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ResetPasswordVerifyDto{
  @ApiProperty({example: 'nsonbao1206@gmail.com'})
  @IsNotEmpty()
  @IsEmail()
  email: string
}
export class ChangePasswordReponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: {
      id: '1234',
      password: '1234'
    },
    nullable: false,
  })
  data: {
    id: string,
    password: string,
  };
  @ApiProperty({ example: 'Thay đổi mật khẩu thành công', nullable: true })
  message: { [key: string]: any };
}

export class ResetPasswordVerifyResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: {
      email: 'nsonbao1206@gmail.com'
    },
    nullable: false,
  })
  data: {
    email: string
  };
  @ApiProperty({ example: 'Gửi email xác nhận thành công', nullable: true })
  message: { [key: string]: any };
}