import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export interface INotificationPayload {
  image?: string;
  body?: string;
  title?: string;
  tokens: string[];
}

export class NotificationPayloadDTO {
  @ApiProperty()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsOptional()
  body?: string;

  @ApiProperty()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsOptional()
  tokens: string[];
}

export interface GetResponse<T> {
  count: number;
  data: T[];
}

export enum NotificationType {
  WELCOME_NOTIFICATION = 'welcome_notification',
}
