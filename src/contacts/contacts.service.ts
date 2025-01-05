import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/database';
import { ContactRepository } from 'src/database/contact.repository';
import { ProfileService } from 'src/profile';
import { GetUserContactInfoResDTO, GetUserContactsResDTO } from 'src/types';

@Injectable()
export class ContactsService {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly userRepository: UserRepository,
    private readonly profileService: ProfileService,
  ) {}

  /**
   * Получить все контакты пользователя
   * @param {number} userID - ID пользователя
   * @returns {Promise<GetUserContactsResDTO>} - Объект с ID контактов пользователя
   */
  async getAllContacts(userID: number): Promise<GetUserContactsResDTO> {
    const contactsID = await this.contactRepository.getUserContactsID(userID);
    return contactsID;
  }

  /**
   * Получить все контакты пользователя
   * @param {number} userID - ID пользователя
   * @returns {Promise<GetUserContactsResDTO[]>} - Объект с информацией контактов пользователя
   */
  async getAllContactsInfo(
    userID: number,
  ): Promise<GetUserContactInfoResDTO[]> {
    const { contactsID } =
      await this.contactRepository.getUserContactsID(userID);
    const promises = contactsID.map(async (contactID) => {
      return await this.profileService.getUserProfileByID(userID, contactID);
    });
    const result = await Promise.all(promises);
    return result;
  }

  /**
   * Добавить контакт пользователю
   * @param {number} ownerID - ID владельца контакта
   * @param {string} contactLogin - Логин контакта, которого добавляют
   * @returns {Promise<void>}
   */
  async addContact(ownerID: number, contactLogin: string): Promise<void> {
    // Шаг 1. Получаем ID собеседника
    const contactID = await this.userRepository.getUserIDByLogin(contactLogin);
    if (!contactID)
      throw new NotFoundException("User with this login doesn't exist");

    if (contactID === ownerID)
      throw new ConflictException('Unable to add yourself');

    // Шаг 2. Проверяем, есть ли у первого пользователя второй в контактах
    const result = await this.contactRepository.isUserContact(
      ownerID,
      contactID,
    );
    if (result) throw new ConflictException('User is already in contact');
    // Шаг 3. Добавляем пользователя в список контактов
    await this.contactRepository.addContact(ownerID, contactID);
  }

  /**
   * Удалить контакт пользователя
   * @param {number} ownerID - ID владельца контакта
   * @param {string} contactLogin - Логин контакта, который удаляют
   * @returns {Promise<void>}
   */
  async deleteContact(ownerID: number, contactLogin: string): Promise<void> {
    const contactID = await this.userRepository.getUserIDByLogin(contactLogin);
    if (!contactID)
      throw new NotFoundException("User with this login doesn't exist");
    await this.contactRepository.deleteContact(ownerID, contactID);
  }
}
