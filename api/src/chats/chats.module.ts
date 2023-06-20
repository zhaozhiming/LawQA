import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
