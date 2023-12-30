import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConfirmDTO {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'user',
  })
  @IsNumber()
  roleId: number;

  @ApiProperty({
    example: '1r543-345435-34534534',
  })
  @IsString()
  @IsNotEmpty()
  clinicId: number;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  lastName?: string;
}
export class ConfirmReponse {
  @ApiProperty({ example: 'true', type: Boolean })
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
  @ApiProperty({ example: 'Gửi mail thành công.', nullable: true })
  message: { [key: string]: any };
}
