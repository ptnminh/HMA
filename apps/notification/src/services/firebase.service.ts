import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
// import config from './firebase.config.json';
@Injectable()
export class FirebaseService {
  constructor() {
    const firebaseConfig = {
      apiKey: 'AIzaSyBUjR_LpKzbeLaBANVXDN84BDLPLRn6VhM',
      authDomain: 'clinus-1d1d1.firebaseapp.com',
      databaseURL:
        'https://clinus-1d1d1-default-rtdb.asia-southeast1.firebasedatabase.app',
      projectId: 'clinus-1d1d1',
      storageBucket: 'clinus-1d1d1.appspot.com',
      messagingSenderId: '698964272341',
      appId: '1:698964272341:web:f8e27c1489c69dbf6cee5c',
      measurementId: 'G-13Z9189280',
    };
    // firebase.initializeApp({
    //   credential: firebase.credential.cert({
    //     projectId: config.project_id,
    //     clientEmail: config.client_email,
    //     privateKey: config.private_key,
    //   }),
    // });
    firebase.initializeApp(firebaseConfig);
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
