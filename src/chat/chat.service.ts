import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Message } from '@prisma/client';
import { UserRepository } from 'src/database';
import { ChatRepository } from 'src/database/chat.repository';
import { GetChatIDResDTO, GetNewMessageResID } from 'src/types';
import { CreateChatBodyDTO } from 'src/types/request-dto/create-chat-body.dto';
import { GetChatMessagesResDTO } from 'src/types/response-dto/get-chat-messages-res.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly chatRepository: ChatRepository,
  ) {}

  /**
   * Создаёт новый чат с указанными участниками и администратором.
   *
   * @param {number} adminID - Идентификатор пользователя, который будет администратором чата.
   * @param {CreateChatBodyDTO} chatMembers - Объект, содержащий логины участников чата.
   * @param {Express.Multer.File} file - Файл, загруженный с использованием Multer (например, изображение чата).
   * @returns {Promise<GetChatIDResDTO>} Промис, возвращающий объект с идентификатором созданного чата.
   * @throws {NotFoundException} Выбрасывается, если один или несколько пользователей не найдены.
   */
  async createChat(
    adminID: number,
    chatMembers: CreateChatBodyDTO,
    file: Express.Multer.File,
  ): Promise<GetChatIDResDTO> {
    const chatMembersID =
      await this.userRepository.getUsersIDByLogin(chatMembers);
    if (chatMembersID.length !== chatMembers.userLogins.length) {
      throw new NotFoundException('One or more users not found');
    }
    const newChat = await this.chatRepository.createChat();
    await this.chatRepository.addChatUsers({ chatMembersID, newChat, adminID });

    return { chatID: newChat.chatID.toString() };
  }

  /**
   * Асинхронно получает сообщения чата по его идентификатору.
   * @param {number} chatMemberID - Идентификатор пользователя, запрашивающего сообщения чата.
   * @param {number} chatID - Идентификатор чата, для которого нужно получить сообщения.
   * @returns {Promise<Message[]>} - Промис, разрешающий массив сообщений в указанном чате.
   * @throws {NotFoundException} - Если запрашивающий пользователь не является участником указанного чата.
   */
  async getChatByID(chatMemberID: number, chatID: number): Promise<Message[]> {
    // Шаг 1. Проверяем, является ли данный пользователь участником чата
    const isChatMember = await this.chatRepository.isUserChatMember(
      chatID,
      chatMemberID,
    );
    if (!isChatMember) throw new NotFoundException('Chat not found');

    // Шаг 2. Получаем сообщения чата
    const messages = await this.chatRepository.getMessagesByChatID(chatID);
    return messages;
  }

  /**
   * Асинхронно отправляет сообщение в чат.
   * @param {number} senderID - Идентификатор отправителя сообщения.
   * @param {number} chatID - Идентификатор чата, в который отправляется сообщение.
   * @param {string} messageText - Текст сообщения.
   * @param {Express.Multer.File} file - Файл, связанный с сообщением.
   * @returns {Promise<GetNewMessageResID>} - Промис, разрешающий объект с идентификатором нового сообщения.
   * @throws {NotFoundException} - Если отправитель не является участником указанного чата.
   */
  async sendMessage(
    senderID: number,
    chatID: number,
    messageText: string,
    file: Express.Multer.File,
  ): Promise<GetNewMessageResID> {
    // Шаг 1. Проверяем, является ли данный пользователь участником чата
    const isChatMember = await this.chatRepository.isUserChatMember(
      chatID,
      senderID,
    );
    if (!isChatMember) throw new NotFoundException("You aren't a chat member");

    // Шаг 2. Создаем новое сообщение
    const newMessage = await this.chatRepository.createChatMessage({
      messageText,
      chatID,
      senderID,
    });

    return { messageID: newMessage.messageID.toString() };

    // TODO: сохранение контента !!!
  }

  /**
   * Асинхронно добавляет пользователя в чат.
   * @param {number} userWantsToAddID - Идентификатор пользователя, желающего добавить другого пользователя в чат.
   * @param {string} userToAddLogin - Логин пользователя, которого нужно добавить в чат.
   * @param {number} chatID - Идентификатор чата, в который нужно добавить пользователя.
   * @returns {Promise<void>} - Промис, не возвращающий значения, представляющий завершение операции добавления пользователя в чат.
   * @throws {ForbiddenException} - Если пользователь, желающий добавить другого пользователя, не является администратором чата.
   * @throws {NotFoundException} - Если пользователь с указанным логином не найден.
   * @throws {ConflictException} - Если пользователь уже состоит в указанном чате.
   */
  async addUserToChat(
    userWantsToAddID: number,
    userToAddLogin: string,
    chatID: number,
  ): Promise<void> {
    // Шаг 1. Проверяем является ли пользователь,
    // который хочет добавить нового пользователя админом
    const isUserAdmin = await this.chatRepository.isUserChatAdmin(
      chatID,
      userWantsToAddID,
    );
    if (!isUserAdmin) throw new ForbiddenException("User isn't admin");
    // Шаг 2. Получаем ID пользователя
    const userToAddID =
      await this.userRepository.getUserIDByLogin(userToAddLogin);
    if (!userToAddID) {
      throw new NotFoundException("User with this login doesn't exist");
    }
    // Шаг 3. Проверяем не состоит ли уже данный пользователь
    // в чате
    const isUserAlreadyInChat = await this.chatRepository.isUserChatMember(
      chatID,
      userToAddID,
    );
    if (isUserAlreadyInChat) {
      throw new ConflictException('User already in chat');
    }

    // Шаг 4. Если админ, то добавляем пользователя в чат
    await this.chatRepository.addChatUser(chatID, userToAddID);
  }

  /**
   * Асинхронно удаляет пользователя из чата.
   * @param {number} userWantsToDelete - Идентификатор пользователя, желающего удалить другого пользователя.
   * @param {string} userToDeleteLogin - Логин пользователя, которого нужно удалить из чата.
   * @param {number} chatID - Идентификатор чата, из которого нужно удалить пользователя.
   * @returns {Promise<void>} - Промис, не возвращающий значения, представляющий завершение операции удаления пользователя из чата.
   * @throws {ForbiddenException} - Если пользователь, желающий удалить другого пользователя, не является администратором чата.
   * @throws {NotFoundException} - Если пользователь с указанным логином не найден.
   */
  async kickUserFromChat(
    userWantsToDelete: number,
    userToDeleteLogin: string,
    chatID: number,
  ): Promise<void> {
    // Шаг 1. Получаем ID пользователя
    const userToDeleteID =
      await this.userRepository.getUserIDByLogin(userToDeleteLogin);
    if (!userToDeleteID) {
      throw new NotFoundException("User with this login doesn't exist");
    }
    // Шаг 2. Является ли пользователь участником чата
    const isUserChatMember = await this.chatRepository.isUserChatMember(
      chatID,
      userToDeleteID,
    );
    if (!isUserChatMember) {
      throw new NotFoundException("User isn't chat member");
    }
    // Шаг 2. Проверяем является ли пользователь,
    // который хочет выгнать пользователя админом
    const isUserAdmin = await this.chatRepository.isUserChatAdmin(
      chatID,
      userWantsToDelete,
    );

    // Шаг 3. Если пользователь хочет удалить сам себя (выйти из чата)
    if (userToDeleteID === userWantsToDelete) {
      if (isUserAdmin) {
        const adminCounts = await this.chatRepository.getAdminCounts(chatID);
        console.log(adminCounts);
        if (adminCounts === 1) {
          throw new ForbiddenException(
            'The user cannot kick himself out while he is the only one admin',
          );
        }
      }
      await this.chatRepository.deleteChatUser(chatID, userToDeleteID);
      return;
    }
    if (!isUserAdmin) throw new ForbiddenException("User isn't admin");
    // Шаг 4. Проверяем является ли пользователь,
    // которого хотят выгнать админом
    const isUserToDeleteAdmin = await this.chatRepository.isUserChatAdmin(
      chatID,
      userToDeleteID,
    );
    if (isUserToDeleteAdmin)
      throw new ForbiddenException('Unable to kick admin');

    // Шаг 5. Если все предыдущие условия выполнены, то
    // удаляем пользователя
    await this.chatRepository.deleteChatUser(chatID, userToDeleteID);
  }
}
