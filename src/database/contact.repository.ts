import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetUserContactsResDTO } from 'src/types';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить ID всех контактов пользователя
   * @param {number} userID - ID пользователя
   * @returns {Promise<GetUserContactsResDTO>} - Объект с ID контактов пользователя
   */
  public async getUserContactsID(
    userID: number,
  ): Promise<GetUserContactsResDTO> {
    const contacts = await this.prisma.contact.findMany({
      where: {
        ownerID: userID,
      },
      select: {
        contactID: true,
      },
    });
    const contactsID = contacts.map((contact) => contact.contactID);
    return { contactsID };
  }

  /**
   * Проверить, является ли пользователь контактом другого пользователя
   * @param {number} ownerID - ID владельца контакта
   * @param {number} contactID - ID контакта
   * @returns {Promise<boolean>} - Результат проверки
   */
  public async isUserContact(
    ownerID: number,
    contactID: number,
  ): Promise<boolean> {
    const result = await this.prisma.contact.findFirst({
      where: {
        ownerID,
        contactID,
      },
    });
    return result ? true : false;
  }

  /**
   * Добавить контакт между пользователями
   * @param {number} ownerID - ID владельца контакта
   * @param {number} contactID - ID контакта
   * @returns {Promise<void>}
   */
  public async addContact(ownerID: number, contactID: number): Promise<void> {
    await this.prisma.contact.create({
      data: {
        ownerID,
        contactID,
      },
    });
  }

  /**
   * Удалить контакт между пользователями
   * @param {number} ownerID - ID владельца контакта
   * @param {number} contactID - ID контакта
   * @returns {Promise<void>}
   */
  public async deleteContact(
    ownerID: number,
    contactID: number,
  ): Promise<void> {
    await this.prisma.contact.delete({
      where: {
        ownerID_contactID: {
          ownerID,
          contactID,
        },
      },
    });
  }
}
