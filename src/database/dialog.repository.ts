import { PrismaService } from 'src/prisma/prisma.service';
import { GetUserDialogDTO, GetUserDialogsDTO } from 'src/types';
import { CreateDialogMessageDTO } from './dto';
import { Message } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DialogRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить ID всех пользователей, с которыми есть диалоги для данного пользователя
   * @param {number} userID - ID пользователя
   * @returns {Promise<GetUserDialogsDTO>} - Объект с пользователями в диалогах
   */
  public async getUsersWithDialogs(userID: number): Promise<GetUserDialogsDTO> {
    const userWithDialogs = await this.prisma.dialogMessage.findMany({
      where: {
        OR: [{ sender: { userID } }, { receiver: { userID } }],
      },
      select: {
        senderID: true,
        receiverID: true,
      },
    });
    const uniqueUsersID = [
      ...new Set(
        userWithDialogs.flatMap((dialog) => [
          dialog.senderID,
          dialog.receiverID,
        ]),
      ),
    ].filter((id) => id !== userID);
    return { usersWithDialog: uniqueUsersID };
  }

  /**
   * Получить ID сообщений для диалога между двумя пользователями
   * @param {number} userID - ID пользователя
   * @param {number} userToChatWithID - ID пользователя, с которым ведется диалог
   * @returns {Promise<GetUserDialogDTO>} - Объект с сообщениями в диалоге
   */
  public async getMessagesByUserID(
    userID: number,
    userToChatWithID: number,
  ): Promise<GetUserDialogDTO> {
    const dialog = await this.prisma.dialogMessage.findMany({
      where: {
        OR: [
          { AND: [{ senderID: userID }, { receiverID: userToChatWithID }] },
          { AND: [{ senderID: userToChatWithID }, { receiverID: userID }] },
        ],
      },
      orderBy: {
        Message: {
          sendAt: 'asc',
        },
      },
      select: {
        messageID: true,
        Message: true,
      },
    });
    const messages = dialog.map((message) => message.Message);
    return { messages: messages };
  }

  /**
   * Создать новое сообщение для диалога
   * @param {CreateDialogMessageDTO} message - Объект с данными о сообщении
   * @returns {Promise<Message>} - Объект нового сообщения
   */
  public async createDialogMessage(
    message: CreateDialogMessageDTO,
  ): Promise<Message> {
    const newMessage = await this.prisma.message.create({
      data: {
        messageText: message.messageText,
        userID: message.senderID,
        DialogMessage: {
          create: {
            senderID: message.senderID,
            receiverID: message.receiverID,
          },
        },
      },
    });
    return newMessage;
  }
}
