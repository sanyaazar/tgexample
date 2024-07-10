import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/database';
import { DialogRepository } from 'src/database/dialog.repository';

import {
  GetNewMessageResID,
  GetUserDialogDTO,
  GetUserDialogsDTO,
} from 'src/types';

@Injectable()
export class DialogService {
  constructor(
    private readonly dialogRepository: DialogRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Получить всех пользователей с диалогами для данного пользователя
   * @param {number} userID - ID пользователя
   * @returns {Promise<GetUserDialogsDTO>} - Объект с пользователями в диалогах
   */
  async getAllUsersWithDialogs(userID: number): Promise<GetUserDialogsDTO> {
    const usersWithDialog =
      await this.dialogRepository.getUsersWithDialogs(userID);
    return usersWithDialog;
  }

  /**
   * Получить ID сообщений для диалога с определенным пользователем
   * @param {number} userID - ID пользователя
   * @param {string} userLogin - Логин собеседника
   * @returns {Promise<GetUserDialogDTO>} - Объект с ID сообщений для диалога
   */
  async getMessagesByUserID(
    userID: number,
    userLogin: string,
  ): Promise<GetUserDialogDTO> {
    // Шаг 1. Получаем ID собеседника
    const userToChatWithID =
      await this.userRepository.getUserIDByLogin(userLogin);
    if (!userToChatWithID)
      throw new NotFoundException("User with this login doesn't exist");
    // Шаг 2. Получаем сообщения диалога
    const dialog = await this.dialogRepository.getMessagesByUserID(
      userID,
      userToChatWithID,
    );
    return dialog;
  }

  /**
   * Отправить сообщение собеседнику
   * @param {number} senderID - ID отправителя
   * @param {string} receiverLogin - Логин получателя
   * @param {string} messageText - Текст сообщения
   * @param {Express.Multer.File} file - Файл (прикрепленный к сообщению)
   * @returns {Promise<GetNewMessageResID>} - Объект с ID нового сообщения
   */
  async sendMessage(
    senderID: number,
    receiverLogin: string,
    messageText: string,
    file: Express.Multer.File,
  ): Promise<GetNewMessageResID> {
    // Шаг 1. Получаем ID собеседника
    const receiverID =
      await this.userRepository.getUserIDByLogin(receiverLogin);
    if (!receiverID)
      throw new NotFoundException("User with this login doesn't exist");
    // Шаг 2. Создаем новое сообщение
    const newMessage = await this.dialogRepository.createDialogMessage({
      messageText,
      senderID,
      receiverID,
    });

    return { messageID: newMessage.messageID.toString() };
    // TODO: сохранение контента !!!
  }
}
