export interface INotificationPayload {
  content: string;
  type: string;
  payload?: any;
  userId: string;
}

export interface GetResponse<T> {
  count: number;
  data: T[];
}

export enum NotificationType {
  WELCOME_NOTIFICATION = 'welcome_notification',
}
