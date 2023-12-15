import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserTokenDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
