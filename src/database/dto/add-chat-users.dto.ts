import { Chat } from '@prisma/client';

export class addChatUsersDTO {
  chatMembersID: { userID: number }[];
  newChat: Chat;
  adminID: number;
}
