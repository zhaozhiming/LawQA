import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './validators/chats.validator';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  async chat(@Body() data: CreateChatDto) {
    const { messages } = data;
    const chat = await this.chatsService.chat(messages);
    return {
      code: 0,
      data: chat,
    };
  }
}
