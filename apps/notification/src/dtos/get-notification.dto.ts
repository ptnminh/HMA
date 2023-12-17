import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRealtimeNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  public content: string;

  @ApiProperty()
  @IsNotEmpty()
  public body: string;

  @ApiProperty()
  @IsNotEmpty()
  public userId: string;
}
