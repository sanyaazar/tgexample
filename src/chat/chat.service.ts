import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetChatIDResDTO, GetNewMessageResID } from 'src/types';
import { CreateChatBodyDTO } from 'src/types/request-dto/create-chat-body.dto';
import { GetChatMessagesResDTO } from 'src/types/response-dto/get-chat-messages-res.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создает новый чат и добавляет участников и администратора в чат.
   *
   * @param {number} adminID - ID администратора, который создаёт чат.
   * @param {CreateChatBodyDTO} chatMembers - Объект, содержащий логины участников чата.
   * @param {Express.Multer.File} file - Загруженный файл, связанный с чатом.
   * @returns {Promise<GetChatIDResDTO>} - Объект с ID созданного чата.
   * @throws {BadRequestException} - Выбрасывается, если один или более пользователей не найдены.
   */
  async createChat(
    adminID: number,
    chatMembers: CreateChatBodyDTO,
    file: Express.Multer.File,
  ): Promise<GetChatIDResDTO> {
    // Шаг 1. Получаем список ID пользователей по их логинам
    const chatMembersID = await Promise.all(
      chatMembers.memberLogins.map(async (member) => {
        return await this.prisma.getUserIDByLogin(member);
      }),
    );
    // Шаг 2. Фильтруем пользователей, если вдруг какие-то логины оказались неверными
    const filteredChatMembersID = chatMembersID.filter((id) => id !== null);

    if (filteredChatMembersID.length !== chatMembers.memberLogins.length) {
      throw new BadRequestException('One or more users not found');
    }
    // Шаг 3. Если все пользователи найдены, то создаем диалог и
    // добавляем пользователей в таблицу ChatUser
    if (filteredChatMembersID.length) {
      const newChat = await this.prisma.chat.create({
        data: {},
      });
      // Добавляем пользователей
      for (const member of filteredChatMembersID) {
        if (member) {
          await this.prisma.chatUser.create({
            data: {
              chatID: newChat.chatID,
              userID: member,
              userRole: Role.USER,
            },
          });
        }
      }
      // Добавляем администратора (ID пользователя, который создавал диалог)
      // Данный ID мы получаем из токена авторизации
      await this.prisma.chatUser.create({
        data: {
          chatID: newChat.chatID,
          userID: adminID,
          userRole: Role.ADMIN,
        },
      });
      if (newChat) return { chatID: newChat.chatID.toString() };
    }
    throw new BadRequestException();
  }

  /**
   * Получает сообщения чата по ID чата и ID участника чата.
   *
   * @param {number} chatMemberID - ID пользователя, который запрашивает сообщения.
   * @param {number} chatID - ID чата, для которого запрашиваются сообщения.
   * @returns {Promise<GetChatMessagesResDTO>} - Возвращает объект с массивом ID сообщений.
   * @throws {BadRequestException} - Если пользователь не является участником чата.
   */
  async getChatByID(
    chatMemberID: number,
    chatID: number,
  ): Promise<GetChatMessagesResDTO> {
    // Шаг 1. Проверяем, является ли данный пользователь участником чата
    const isChatMember = await this.prisma.chatUser.findFirst({
      where: {
        chatID,
        userID: chatMemberID,
      },
    });
    if (!isChatMember)
      throw new BadRequestException("You aren't a chat member");

    // Шаг 2. Получаем сообщения чата
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        chatID,
      },
      select: {
        messageID: true,
      },
    });
    const messagesID = messages.map((message) => message.messageID.toString());
    return { messagesID };
  }

  /**
   * Отправляет сообщение в чат.
   *
   * @param {number} senderID - ID пользователя, отправляющего сообщение.
   * @param {number} chatID - ID чата, в который отправляется сообщение.
   * @param {string} messageText - Текст сообщения.
   * @param {Express.Multer.File} file - Файл, прикрепленный к сообщению.
   * @returns {Promise<GetNewMessageResID>} - Возвращает объект с ID нового сообщения.
   * @throws {BadRequestException} - Если пользователь не является участником чата или если создание сообщения/чата не удалось.
   */
  async sendMessage(
    senderID: number,
    chatID: number,
    messageText: string,
    file: Express.Multer.File,
  ): Promise<GetNewMessageResID> {
    // Шаг 1. Проверяем, является ли данный пользователь участником чата
    const isChatMember = await this.prisma.chatUser.findFirst({
      where: {
        chatID,
        userID: senderID,
      },
    });
    if (!isChatMember)
      throw new BadRequestException("You aren't a chat member");

    // Шаг 2. Создаем новое сообщение
    const newMessage = await this.prisma.message.create({
      data: {
        messageText,
        userID: senderID,
      },
    });

    if (newMessage) {
      const newChatMessage = await this.prisma.chatMessage.create({
        data: {
          chatID,
          senderID,
          messageID: newMessage.messageID,
        },
      });
      if (newChatMessage) return { messageID: newMessage.messageID.toString() };
    }
    // сохранение контента !!!
    throw new BadRequestException();
  }

  /**
   * Добавляет пользователя в чат.
   *
   * @param {number} userWantsToAdd - ID пользователя, который хочет добавить другого пользователя в чат.
   * @param {string} userToAddLogin - Логин пользователя, которого нужно добавить в чат.
   * @param {number} chatID - ID чата, в который нужно добавить пользователя.
   * @returns {Promise<boolean>} - Возвращает true, если пользователь успешно добавлен в чат.
   * @throws {BadRequestException} - Если пользователь с указанным логином не существует, уже состоит в чате или если добавляющий пользователь не является администратором.
   */
  async addUserToChat(
    userWantsToAdd: number,
    userToAddLogin: string,
    chatID: number,
  ): Promise<boolean> {
    // Шаг 1. Получаем ID пользователя
    const userToAddID = await this.prisma.getUserIDByLogin(userToAddLogin);
    if (!userToAddID) {
      throw new BadRequestException("User with this login doesn't exist");
    }

    // Шаг 2. Проверяем не состоит ли уже данный пользователь
    // в чате
    const isUserAlreadyInChat = await this.prisma.chatUser.findFirst({
      where: {
        chatID,
        userID: userToAddID,
      },
    });
    if (isUserAlreadyInChat) {
      throw new BadRequestException('User already in chat');
    }

    // Шаг 3. Проверяем является ли пользователь,
    // который хочет добавить нового пользователя админом
    const isUserAdmin = await this.prisma.chatUser.findFirst({
      where: {
        chatID,
        userID: userWantsToAdd,
        userRole: Role.ADMIN,
      },
    });
    if (!isUserAdmin) throw new BadRequestException();

    // Шаг 4. Если админ, то добавляем пользователя в чат
    const result = await this.prisma.chatUser.create({
      data: {
        chatID,
        userID: userToAddID,
        userRole: Role.USER,
      },
    });

    if (result) return true;
    throw new BadRequestException();
  }

  /**
   * Удаляет пользователя из чата, если выполняются все условия.
   * @param {number} userWantsToDelete - ID пользователя, который хочет удалить другого пользователя из чата.
   * @param {string} userToAddLogin - Логин пользователя, которого нужно удалить из чата.
   * @param {number} chatID - ID чата, из которого нужно удалить пользователя.
   * @returns {Promise<boolean>} Возвращает true, если пользователь успешно удален из чата, иначе выбрасывает исключение BadRequestException.
   * @throws {BadRequestException} Если пользователь с указанным логином не существует, пользователь не состоит в чате, запрос на удаление выполняет не администратор, пользователь, которого пытаются удалить, является администратором, или в случае других ошибок.
   */
  async kickUserFromChat(
    userWantsToDelete: number,
    userToDeleteLogin: string,
    chatID: number,
  ): Promise<boolean> {
    // Шаг 1. Получаем ID пользователя
    const userToDeleteID =
      await this.prisma.getUserIDByLogin(userToDeleteLogin);
    if (!userToDeleteID) {
      throw new BadRequestException("User with this login doesn't exist");
    }
    // Шаг 2. Проверяем состоит ли данный пользователь
    // в чате
    const isUserToDeleteInChat = await this.prisma.chatUser.findFirst({
      where: {
        chatID,
        userID: userToDeleteID,
      },
    });
    if (!isUserToDeleteInChat) {
      throw new BadRequestException('There is no user with this login in chat');
    }

    // Шаг 3. Проверяем является ли пользователь,
    // который хочет выгнать пользователя админом
    const isUserAdmin = await this.prisma.chatUser.findFirst({
      where: {
        chatID,
        userID: userWantsToDelete,
        userRole: Role.ADMIN,
      },
    });
    if (!isUserAdmin) throw new BadRequestException("User isn't admin");

    // Шаг 4. Проверяем является ли пользователь,
    // которого хотят выгнать админом
    const isUserToDeleteAdmin = await this.prisma.chatUser.findFirst({
      where: {
        chatID,
        userID: userToDeleteID,
        userRole: Role.ADMIN,
      },
    });
    if (isUserToDeleteAdmin)
      throw new BadRequestException('Unable to kick admin');

    // Шаг 5. Если все предыдущие условия выполнены, то
    // удаляем пользователя
    const result = await this.prisma.chatUser.delete({
      where: {
        chatID_userID: {
          chatID: chatID,
          userID: userToDeleteID,
        },
      },
    });
    if (result) return true;
    throw new BadRequestException();
  }
}
