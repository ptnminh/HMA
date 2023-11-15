export class RegisterDto {
  email: string;

  password: string;

  firstName?: string;

  lastName?: string;

  roleId?: number;

  emailVerified?: boolean;

  role?: string;

  isInputPassword?: boolean;
}

export class GoogleOauthDTO {
  email: string;
  avatar: string;
  userId: string;
}
