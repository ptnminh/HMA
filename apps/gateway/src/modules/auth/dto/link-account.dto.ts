import { ApiProperty } from '@nestjs/swagger';

class Accounts {
  id: string;
  provider: string;
  key: string;
  avatar: string;
}

export class LinkAccountResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: [
      {
        id: '5d987c3bfb881ec86b476bcc',
        provider: 'google',
        key: 'ptnminh@gmail.com',
        avatar: 'https://avatars.githubusercontent.com/u/47259054?v=4',
      },
    ],
    nullable: true,
  })
  data: Accounts;
  @ApiProperty({ example: 'Liên kết thành công', nullable: true })
  message: { [key: string]: any };
}

export class GetUserAccountsResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: [
      {
        id: '5d987c3bfb881ec86b476bcc',
        provider: 'google',
        key: 'ptnminh@gmail.com',
        avatar: 'https://avatars.githubusercontent.com/u/47259054?v=4',
      },
    ],
    nullable: true,
  })
  data: Accounts;
  @ApiProperty({
    example: 'Lấy danh sách tài khoản thành công.',
    nullable: true,
  })
  message: { [key: string]: any };
}
export class DeleteAccountsResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: [
      {
        id: '5d987c3bfb881ec86b476bcc',
        provider: 'google',
        key: 'ptnminh@gmail.com',
        avatar: 'https://avatars.githubusercontent.com/u/47259054?v=4',
      },
    ],
    nullable: true,
  })
  data: Accounts;
  @ApiProperty({
    example: 'Xóa tài khoản thành công',
    nullable: true,
  })
  message: { [key: string]: any };
}
