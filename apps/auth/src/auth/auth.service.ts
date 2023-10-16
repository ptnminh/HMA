import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}
  getHello(): string {
    return 'Hello World!';
  }
}
