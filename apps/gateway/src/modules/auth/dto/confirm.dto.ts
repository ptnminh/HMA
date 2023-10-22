import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmDTO {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'user',
    enum: ['user', 'admin', 'manager', 'doctor'],
  })
  @IsString()
  @IsIn(['user', 'admin', 'manager', 'doctor'])
  @IsNotEmpty()
  role: string;
}
export class ConfirmReponse {
  @ApiProperty({ example: 'success' })
  status: string;
  @ApiProperty({
    example: {
      link: 'http://test.com',
    },
    nullable: false,
  })
  data: {
    link: string;
  };
  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any };
  @ApiProperty({ example: 'Đăng nhập thành công', nullable: true })
  message: { [key: string]: any };
}
