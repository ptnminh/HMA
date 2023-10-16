import { ApiProperty } from '@nestjs/swagger';
import { IRegisterResponse } from '../interface/creath-auth.interface';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterResponse {
  @ApiProperty({ example: 'success' })
  status: string;
  @ApiProperty({
    example: {
      user: {
        email: 'test@denrox.com',
        id: '5d987c3bfb881ec86b476bcc',
        firstName: 'ptnminh',
        lastName: 'ptnminh',
        token: 'token',
        avatar: 'https://avatars.githubusercontent.com/u/47259054?v=4',
      },
    },
    nullable: true,
  })
  data: {
    user: IRegisterResponse;
  };
  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any };
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
}
