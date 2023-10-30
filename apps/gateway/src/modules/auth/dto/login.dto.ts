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
  @ApiProperty({ example: 'Đăng nhập thành công', nullable: true })
  message: { [key: string]: any };
}
export class AccountCreateReponse {
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
