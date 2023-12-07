import { Controller } from '@nestjs/common';
import { ChatService } from './chats.service';

@Controller()
export class ChatController {
  constructor(private readonly planService: ChatService) {}
}
