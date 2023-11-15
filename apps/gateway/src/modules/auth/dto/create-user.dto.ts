import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../interface/creath-auth.interface';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: {
      user: {
        email: 'test@denrox.com',
        id: '5d987c3bfb881ec86b476bcc',
        firstName: 'ptnminh',
        lastName: 'ptnminh',
        avatar: 'https://avatars.githubusercontent.com/u/47259054?v=4',
      },
      token: 'token',
    },
    nullable: true,
  })
  data: {
    user: IUser;
    token: string;
  };
  @ApiProperty({ example: 'Đăng ký thành công', nullable: true })
  message: { [key: string]: any };
}

export class RegisterDto {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'user' })
  @IsString()
  @IsOptional()
  role?: string;
}
export class AccountDto {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: '12344-345435-34534534s' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  picture?: string;

  @ApiProperty({ example: 'google' })
  @IsString()
  @IsNotEmpty()
  provider: string;
}

export class LinkAccountWithEmail {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'example@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'google' })
  @IsString()
  @IsNotEmpty()
  provider: string;
}
