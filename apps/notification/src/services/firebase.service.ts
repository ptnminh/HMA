import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
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
      databaseURL:
        'https://clinus-1d1d1-default-rtdb.asia-southeast1.firebasedatabase.app',
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

  public async readNotiLengthFromDB(userId: string) {
    return firebase
      .database()
      .ref('notifications')
      .child(userId)
      .once('value')
      .then((snapshot) => {
        return snapshot.numChildren();
      })
      .catch((e) => {
        console.log('error from read', e);
      });
  }

  async saveNewNotiToUser({
    userId,
    currentNotiLength,
    newData,
  }: {
    userId: string;
    currentNotiLength: number;
    newData: any;
  }) {
    const ref = firebase.database().ref('notifications');
    if (!currentNotiLength) {
      return ref.child(userId).set({ '0': newData });
    }
    const newKeyRef = ref
      .child(userId)
      .child(currentNotiLength.toString())
      .set(newData);
    return newKeyRef;
  }
}
