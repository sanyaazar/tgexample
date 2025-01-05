import { Injectable } from '@nestjs/common';
import { Chat, ChatUser, Message, Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { addChatUsersDTO, CreateChatMessageDTO } from './dto';
import { CreateChatBodyDTO } from 'src/types/request-dto/create-chat-body.dto';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт новый чат в базе данных.
   *
   * @returns {Promise<Chat>} Промис, возвращающий созданный объект чата.
   */
  public async createChat(): Promise<Chat> {
    const newChat = await this.prisma.chat.create({
      data: {},
    });
    return newChat;
  }

  /**
   * Добавить пользователей к чату
   * @param {addChatUsersDTO} input - Объект с данными для добавления пользователей к чату
   * @returns {Promise<void>}
   */
  public async addChatUsers(input: addChatUsersDTO): Promise<void> {
    const chatUsers: Prisma.ChatUserUncheckedCreateInput[] =
      input.chatMembersID.map((member) => ({
        chatID: input.newChat.chatID,
        userID: member.userID,
        userRole: Role.USER,
      }));
    chatUsers.push({
      chatID: input.newChat.chatID,
      userID: input.adminID,
      userRole: Role.ADMIN,
    });
    await this.prisma.chatUser.createMany({
      data: chatUsers,
    });
  }

  /**
   * Добавить пользователя в чат
   * @param {number} chatID - ID чата
   * @param {number} userID - ID пользователя
   * @returns {Promise<ChatUser>} - Объект пользователя чата
   */
  public async addChatUser(chatID: number, userID: number): Promise<ChatUser> {
    const result = await this.prisma.chatUser.create({
      data: {
        chatID,
        userID,
        userRole: Role.USER,
      },
    });
    return result;
  }

  /**
   * Удалить пользователя из чата
   * @param {number} chatID - ID чата
   * @param {number} userID - ID пользователя
   * @returns {Promise<void>}
   */
  public async deleteChatUser(chatID: number, userID: number): Promise<void> {
    await this.prisma.chatUser.delete({
      where: {
        chatID_userID: {
          chatID: chatID,
          userID,
        },
      },
    });
  }

  /**
   * Проверить, является ли пользователь участником чата
   * @param {number} chatID - ID чата
   * @param {number} chatMemberID - ID пользователя
   * @returns {Promise<boolean>} - Результат проверки
   */
  public async isUserChatMember(
    chatID: number,
    chatMemberID: number,
  ): Promise<boolean> {
    const isChatMember = await this.prisma.chatUser.findFirst({
      where: {
        chatID,
        userID: chatMemberID,
      },
    });
    if (isChatMember) return true;
    else return false;
  }

  /**
   * Проверить, является ли пользователь админом чата
   * @param {number} chatID - ID чата
   * @param {number} chatMemberID - ID пользователя
   * @returns {Promise<boolean>} - Результат проверки
   */
  public async isUserChatAdmin(
    chatID: number,
    chatMemberID: number,
  ): Promise<boolean> {
    const isChatMember = await this.prisma.chatUser.findFirst({
      where: {
        chatID,
        userID: chatMemberID,
        userRole: Role.ADMIN,
      },
    });
    if (isChatMember) return true;
    else return false;
  }

  /**
   * Получить ID сообщений по ID чата
   * @param {number} chatID - ID чата
   * @returns {Promise<string[]>} - Массив строк с ID сообщений
   */
  public async getMessagesIDByChatID(chatID: number): Promise<string[]> {
    const messages = await this.getMessagesByChatID(chatID);
    const messagesID = messages.map((message) => message.messageID.toString());
    return messagesID;
  }

  /**
   * Получить сообщения по идентификатору чата
   * @param {number} chatID - Идентификатор чата
   * @returns {Promise<Message[]>} - Массив сообщений
   */
  public async getMessagesByChatID(chatID: number): Promise<Message[]> {
    const messagesDb = await this.prisma.chatMessage.findMany({
      where: {
        chatID,
      },
      select: {
        Message: true,
      },
    });
    const messages = messagesDb.map((message) => message.Message);
    return messages;
  }

  /**
   * Создать сообщение чата
   * @param {CreateChatMessageDTO} message - Объект с данными нового сообщения
   * @returns {Promise<Message>} - Созданное сообщение
   */
  public async createChatMessage(
    message: CreateChatMessageDTO,
  ): Promise<Message> {
    const newMessage = await this.prisma.message.create({
      data: {
        messageText: message.messageText,
        userID: message.senderID,
        ChatMessage: {
          create: {
            chatID: message.chatID,
            senderID: message.senderID,
          },
        },
      },
    });
    return newMessage;
  }

  /**
   * Асинхронно получает количество администраторов в чате для указанного пользователя.
   * @param {number} chatID - Идентификатор чата, для которого нужно подсчитать количество администраторов в чате.
   * @returns {Promise<number>} - Промис, разрешающий количество администраторов в чате для указанного пользователя.
   */
  public async getAdminCounts(chatID: number): Promise<number> {
    const adminCounts = await this.prisma.chatUser.count({
      where: {
        chatID,
        userRole: Role.ADMIN,
      },
    });
    return adminCounts;
  }

  /**
   * Удаляет чат, всех связанных с ним пользователей и сообщения.
   *
   * @async
   * @function deleteChat
   * @param {number} chatID - Идентификатор удаляемого чата.
   * @returns {Promise<void>} - Промис без возвращаемого значения, указывающий на успешное выполнение удаления.
   */
  public async deleteChat(chatID: number): Promise<void> {
    await this.prisma.chatUser.deleteMany({
      where: {
        chatID,
      },
    });
    await this.prisma.chatMessage.deleteMany({
      where: {
        chatID,
      },
    });
    await this.prisma.chat.delete({
      where: {
        chatID,
      },
    });
  }
}
