import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class FindUserByEmailDto {
  @ApiProperty({ required: false, example: 'ptnminh.ltdn@gmail.com' })
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, example: 'true' })
  @IsOptional()
  emailVerified?: string;
}
