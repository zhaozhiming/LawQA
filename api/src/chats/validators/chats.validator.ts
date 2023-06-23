import { IsNotEmpty } from 'class-validator';
import { Message } from '../../data-structure';

export class CreateChatDto {
  @IsNotEmpty()
  messages: Message[];
}