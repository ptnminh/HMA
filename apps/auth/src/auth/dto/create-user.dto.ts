export class RegisterDto {
  email: string;

  password: string;

  firstName?: string;

  lastName?: string;

  roleId?: number;

  emailVerified?: boolean;
}

export class GoogleOauthDTO {
  email: string;
  avatar: string;
  userId: string;
}
