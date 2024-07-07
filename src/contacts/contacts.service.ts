import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetUserContactsResDTO } from 'src/types';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получает все контакты для указанного пользователя.
   *
   * @param {number} userID - Идентификатор пользователя, для которого необходимо получить контакты.
   * @returns {Promise<GetUserContactsResDTO>} Объект, содержащий массив идентификаторов контактов.
   */
  async getAllContacts(userID: number): Promise<GetUserContactsResDTO> {
    const contacts = await this.prisma.contact.findMany({
      where: {
        contact1: userID,
      },
      select: {
        contact2: true,
      },
    });
    const contactsID = contacts.map((contact) => contact.contact2.toString());
    return { contactsID };
  }

  /**
   * Добавляет контакт для пользователя.
   *
   * @param {number} contact1 - Идентификатор пользователя, который добавляет контакт.
   * @param {string} contact2Login - Логин пользователя, которого добавляют в контакты.
   * @returns {Promise<boolean>} Промис, возвращающий true, если контакт успешно добавлен.
   * @throws {BadRequestException} Выбрасывается, если пользователь уже находится в списке контактов или если добавление не удалось.
   */
  async addContact(contact1: number, contact2Login: string): Promise<boolean> {
    // Шаг 1. Получаем ID собеседника
    const contact2ID = await this.prisma.getUserIDByLogin(contact2Login);

    // Шаг 2. Проверяем, есть ли у первого пользователя второй в контактах
    const result = await this.prisma.contact.findFirst({
      where: {
        contact1,
        contact2: contact2ID,
      },
    });
    if (result) throw new BadRequestException('User is already in contact');
    // Шаг 3. Добавляем пользователя в список контактов
    const user = await this.prisma.contact.create({
      data: {
        contact1,
        contact2: contact2ID,
      },
    });
    if (user) return true;
    throw new BadRequestException();
  }

  /**
   * Удаляет контакт из списка контактов пользователя.
   *
   * @param {number} contact1 - Идентификатор пользователя, который удаляет контакт.
   * @param {string} contact2Login - Логин пользователя, который удаляется из контактов.
   * @returns {Promise<boolean>} Промис, возвращающий true, если контакт успешно удалён.
   * @throws {BadRequestException} Выбрасывается, если пользователя нет в списке контактов.
   * @throws {BadGatewayException} Выбрасывается, если произошла ошибка при удалении контакта.
   */
  async deleteContact(
    contact1: number,
    contact2Login: string,
  ): Promise<boolean> {
    // Шаг 1. Получаем ID собеседника
    const contact2ID = await this.prisma.getUserIDByLogin(contact2Login);

    // Шаг 2. Проверяем, есть ли у первого пользователя второй в контактах
    const result = await this.prisma.contact.findFirst({
      where: {
        contact1,
        contact2: contact2ID,
      },
    });
    if (!result) throw new BadRequestException("User isn't a contact");

    // Шаг 3. Удаляем пользователя из списка контактов
    const user = await this.prisma.contact.delete({
      where: {
        contact1_contact2: {
          contact1,
          contact2: contact2ID,
        },
      },
    });
    if (user) return true;
    throw new BadGatewayException();
  }
}
