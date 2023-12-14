export class RegisterDto {
  email: string;

  password: string;

  firstName?: string;

  lastName?: string;

  moduleId?: number;

  emailVerified?: boolean;

  isInputPassword?: boolean;

  isMobile?: boolean;
}

export class GoogleOauthDTO {
  email: string;
  avatar: string;
  userId: string;
}
