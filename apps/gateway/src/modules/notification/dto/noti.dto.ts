import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @IsString()
  @IsOptional()
  @ApiProperty()
  moduleId: string;

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

  @IsString()
  @IsOptional()
  @ApiProperty()
  moduleId: string;
}
