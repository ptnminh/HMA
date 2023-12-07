import { ApiProperty } from '@nestjs/swagger';

export class FindUserByEmailResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: {
      email: 'email@gmail.com',
      id: '787439579-4534-45345445',
    },
    nullable: false,
  })
  data: { email: string; id: string };
  @ApiProperty({ example: 'Tìm user thành công', nullable: true })
  message: { [key: string]: any };
}
