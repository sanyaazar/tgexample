export class CreateChatMessageDTO {
  messageText: string;
  chatID: number;
  senderID: number;
  file?: Express.Multer.File;
}
