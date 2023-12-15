export interface INotificationPayload {
  image?: string;
  body?: string;
  title?: string;
  tokens: string[];
}

export interface GetResponse<T> {
  count: number;
  data: T[];
}

export enum NotificationType {
  WELCOME_NOTIFICATION = 'welcome_notification',
}
