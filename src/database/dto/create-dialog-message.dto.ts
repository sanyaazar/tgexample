export class CreateDialogMessageDTO {
  messageText: string;
  senderID: number;
  receiverID: number;
  file?: Express.Multer.File;
}
