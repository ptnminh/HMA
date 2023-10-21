import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IUser } from '../interface/creath-auth.interface';

export class LoginDto {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginReponse {
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
    user: IUser;
  };
  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any };
  @ApiProperty({ example: 'Đăng nhập thành công', nullable: true })
  message: { [key: string]: any };
}
