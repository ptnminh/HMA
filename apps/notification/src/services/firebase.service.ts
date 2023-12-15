import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import * as FCM from 'fcm-node';
import config from './firebase.config.json';
@Injectable()
export class FirebaseService {
  constructor() {
    firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: config.project_id,
        clientEmail: config.client_email,
        privateKey: config.private_key,
      }),
    });
  }

  public sendMessage(
    token: string,
    message?: string,
    payload?: any,
  ): Promise<string> {
    return firebase.messaging().send({
      token,
      notification: {
        body: message,
      },
      data: payload,
    });
  }

  public async multiCastMessage(
    tokens: string[],
    body?: string,
    title?: string,
    image?: string,
  ): Promise<firebase.messaging.BatchResponse> {
    return firebase.messaging().sendMulticast({
      tokens,
      notification: {
        body,
        title,
        imageUrl: image,
      },
    });
  }
}
