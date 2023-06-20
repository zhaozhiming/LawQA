import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateChatDto } from './validators/chats.validator';

// @UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  async chat(@Body() data: CreateChatDto) {
    const { prompt } = data;
    const chat = await this.chatsService.chat(prompt);
    return {
      code: 0,
      data: chat,
    };
  }
}
