import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  GetNewMessageResID,
  GetUserDialogDTO,
  GetUserDialogsDTO,
} from 'src/types';

@Injectable()
export class DialogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получает все диалоги пользователя по его логину.
   * @param {string} userID - id пользователя, чьи диалоги нужно получить.
   * @returns {Promise<GetUserDialogsDTO>} Промис, который разрешается в объект, содержащий массив идентификаторов пользователей с которыми имеются диалоги.
   * @throws {BadRequestException} Выбрасывает исключение, если не удалось найти диалоги пользователя.
   */
  async getAllDialogs(userID: number): Promise<GetUserDialogsDTO> {
    const userWithDialogs = await this.prisma.dialogMessage.findMany({
      where: {
        OR: [{ sender: { userID } }, { receiver: { userID } }],
      },
      select: {
        senderID: true,
        receiverID: true,
      },
    });

    const uniqueUserIDs = [
      ...new Set(
        userWithDialogs.flatMap((dialog) => [
          dialog.senderID,
          dialog.receiverID,
        ]),
      ),
    ].filter((id) => id !== userID);

    if (uniqueUserIDs) {
      return {
        usersWithDialog: uniqueUserIDs,
      };
    }
    throw new BadRequestException();
  }

  /**
   * Получает диалог между текущим пользователем и пользователем с заданным логином.
   *
   * @param {number} userID - Идентификатор текущего пользователя.
   * @param {string} userLogin - Логин пользователя, с которым текущий пользователь хочет начать диалог.
   * @returns {Promise<GetUserDialogDTO>} Объект, содержащий массив идентификаторов сообщений в диалоге.
   * @throws {BadRequestException} Если пользователь с заданным логином не найден или если диалог не найден.
   */
  async getDialogByID(
    userID: number,
    userLogin: string,
  ): Promise<GetUserDialogDTO> {
    // Шаг 1. Получаем ID собеседника
    const userToChatWithID = await this.prisma.getUserIDByLogin(userLogin);
    // Шаг 2. Получаем сообщения диалога
    const dialog = await this.prisma.dialogMessage.findMany({
      where: {
        OR: [
          { AND: [{ senderID: userID }, { receiverID: userToChatWithID }] },
          { AND: [{ senderID: userToChatWithID }, { receiverID: userID }] },
        ],
      },
      orderBy: {
        message: {
          sendAt: 'asc',
        },
      },
      select: {
        messageID: true,
        message: {
          select: {
            sendAt: true,
          },
        },
      },
    });

    if (dialog.length) {
      const messages = dialog.map((message) => message.messageID.toString());
      return { messagesID: messages };
    }
    throw new BadRequestException();
  }

  /**
   * Отправляет сообщение от отправителя пользователю с указанным логином.
   * @param {number} senderID - ID отправителя сообщения.
   * @param {string} receiverLogin - Логин получателя сообщения.
   * @param {string} messageText - Текст сообщения.
   * @param {Express.Multer.File} file - Файл, прикрепленный к сообщению (если есть).
   * @returns {Promise<GetNewMessageResID>} Объект с ID нового сообщения.
   * @throws {BadRequestException} Если не удалось найти получателя или создать сообщение.
   */
  async sendMessage(
    senderID: number,
    receiverLogin: string,
    messageText: string,
    file: Express.Multer.File,
  ): Promise<GetNewMessageResID> {
    // Шаг 1. Получаем ID собеседника
    const receiverID = await this.prisma.getUserIDByLogin(receiverLogin);
    // Шаг 2. Создаем новое сообщение
    const newMessage = await this.prisma.message.create({
      data: {
        messageText,
        userID: senderID,
      },
    });

    if (newMessage) {
      const newDialogMessage = await this.prisma.dialogMessage.create({
        data: {
          senderID,
          receiverID,
          messageID: newMessage.messageID,
        },
      });
      if (newDialogMessage)
        return { messageID: newMessage.messageID.toString() };
    }
    // сохранение контента !!!
    throw new BadRequestException();
  }
}
