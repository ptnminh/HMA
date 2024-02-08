export class RegisterDto {
  email: string;

  password: string;

  firstName?: string;

  lastName?: string;

  moduleId?: number;

  emailVerified?: boolean;

  isInputPassword?: boolean;

  isMobile?: boolean;

  noActionSendEmail?: boolean;

  type?: string;

  rawPassword?: string;

  uniqueId?: string;

  notificationData?: any;
}

export class GoogleOauthDTO {
  email: string;
  avatar: string;
  userId: string;
}
