import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { GetResponse, INotificationPayload } from './types';
import { Notification, NotificationDocument } from './app.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateRealtimeNotificationDto } from './dtos/get-notification.dto';
import { FirebaseService } from './services';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private firebaseService: FirebaseService,
  ) {
    this.authClient.connect();
  }

  public async createNotification(data: INotificationPayload): Promise<void> {
    try {
      const { tokens, title, image, body } = data;
      if (tokens && tokens.length > 0) {
        this.firebaseService
          .multiCastMessage(tokens, body, title, image)
          .then(() => {
            this.logger.log('notificaiton sent.');
          })
          .catch((e) => {
            this.logger.error('notification failed.', e);
          });
      } else {
        this.logger.log('device id is not exists!');
      }
    } catch (e) {
      throw e;
    }
  }

  public async createRealtimeNotifications(
    data: CreateRealtimeNotificationDto,
  ): Promise<any> {
    try {
      const id = uuid();
      const { userId, ...payload } = data;
      const notiLength =
        await this.firebaseService.readNotiLengthFromDB(userId);

      const saveNewNotiToUser = await this.firebaseService.saveNewNotiToUser({
        userId,
        currentNotiLength: notiLength || 0,
        newData: {
          ...payload,
          id,
          sendingTime: new Date().toISOString(),
        },
      });
      return saveNewNotiToUser;
    } catch (e) {
      throw e;
    }
  }
}
