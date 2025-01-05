import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/database';
import { DialogRepository } from 'src/database/dialog.repository';
import { S3Repository } from 'src/database/s3.repository';
import { v4 as uuidv4 } from 'uuid';

import {
  GetNewMessageResID,
  GetUserDialogDTO,
  GetUserDialogsDTO,
} from 'src/types';
import { ConfigService } from '@nestjs/config';
import { ContentRepository } from 'src/database/content.repository';

@Injectable()
export class DialogService {
  private videoTypes: string[];
  private imageTypes: string[];

  constructor(
    private readonly dialogRepository: DialogRepository,
    private readonly userRepository: UserRepository,
    private readonly s3Repository: S3Repository,
    private readonly configService: ConfigService,
    private readonly contentRepository: ContentRepository,
  ) {
    console.log(this.configService.get<string>('VIDEO_TYPES')!);
    console.log(this.configService.get<string>('IMAGE_TYPES')!);
    this.videoTypes = this.configService.get<string>('VIDEO_TYPES')!.split(',');
    this.imageTypes = this.configService.get<string>('IMAGE_TYPES')!.split(',');
  }

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
    // Шаг 3. Отправляем сообщение в s3 хранилище
    const uuidFile = uuidv4();
    if (file) {
      const fileExtension = await this.getFileExtension(file.originalname);
      if (this.videoTypes?.includes(fileExtension!)) {
        await this.s3Repository.uploadFile(
          'videos',
          uuidFile + '.' + fileExtension,
          file.buffer,
        );
        const createdContentBD = await this.contentRepository.createContent(
          newMessage.messageID,
          uuidFile,
        );
      } else if (this.imageTypes?.includes(fileExtension!)) {
        await this.s3Repository.uploadFile(
          'photos',
          uuidFile + '.' + fileExtension,
          file.buffer,
        );
        const createdContentBD = await this.contentRepository.createContent(
          newMessage.messageID,
          uuidFile,
        );
      }
    }
    return { messageID: newMessage.messageID.toString() };
  }

  /**
   * Получает расширение файла на основе его имени.
   *
   * @private
   * @param {string} fileName - Имя файла, для которого нужно получить расширение.
   * @returns {Promise<string | undefined>} Расширение файла, если оно существует; в противном случае - undefined.
   */
  private async getFileExtension(
    fileName: string,
  ): Promise<string | undefined> {
    return fileName.split('.').pop();
  }
}
