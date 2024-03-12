import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateUserTokenDTO {
  @IsString()
  @ApiProperty({ example: 'userId' })
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'token' })
  token: string;
}
export class PushNotificationDTO {
  @IsString()
  @IsOptional()
  @ApiProperty()
  userId: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  moduleId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  body?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  image?: string;
}

export class CreateRealtimeNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  public content: string;

  @ApiProperty()
  @IsNotEmpty()
  public title: string;

  @ApiProperty()
  @IsOptional()
  public userId: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  moduleId: number;
}
