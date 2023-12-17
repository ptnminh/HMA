import { ApiProperty } from '@nestjs/swagger';

export class CreateUserTokenResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({ example: 'Tạo token thành công.', nullable: true })
  message: { [key: string]: any };
}
export class CreateRealtimeNotificationResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({ example: 'Tạo notification thành công', nullable: true })
  message: { [key: string]: any };
}
