import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserTokenDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
export class PushNotificationDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
