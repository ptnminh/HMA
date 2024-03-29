import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {IsNotEmpty,  IsString, IsEmail, IsOptional, IsIn } from 'class-validator';

export class ChangePasswordDto { 
  /*@ApiProperty({ example: '92803cf0-abda-4282-ad82-772d7c6af0c1' })
  @IsString()
  @IsNotEmpty()
  id: string;*/

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @Type(() => Boolean)
  @ApiProperty({example: "true"})
  @IsNotEmpty()
  isReset: boolean;
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
    example: null,
    nullable: true
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
      token: "Token"
    },
    nullable: false,
  })
  data: {
    email: string
  };
  @ApiProperty({ example: 'Gửi email xác nhận thành công', nullable: true })
  message: { [key: string]: any };
}


export class addNewPasswordDto {
  @ApiProperty({example: 'test@gmail.com'})
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({example: '12345678'})
  @IsNotEmpty()
  @IsString()
  password: string;
}