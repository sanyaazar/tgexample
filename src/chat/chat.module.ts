import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import {
  ChatRepository,
  ContactRepository,
  UserRepository,
} from 'src/database';

@Module({
  providers: [ChatService, UserRepository, ChatRepository, ContactRepository],
  controllers: [ChatController],
  exports: [UserRepository, ChatRepository, ContactRepository],
})
export class ChatModule {}
