import { Injectable } from '@nestjs/common';
import { Content } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создает новый контент в базе данных.
   *
   * @async
   * @param {number} messageID - Идентификатор сообщения, к которому относится контент.
   * @param {string} uuidFile - Уникальный идентификатор файла, который будет сохранен в контенте.
   * @returns {Promise<Content>} Возвращает объект созданного контента.
   * @throws {Error} Если не удается создать контент.
   */
  async createContent(messageID: number, uuidFile: string): Promise<Content> {
    const createdContent = await this.prisma.content.create({
      data: {
        filepath: uuidFile,
        messageID: messageID,
      },
    });
    return createdContent;
  }

  /**
   * Получает контент по идентификатору сообщения.
   *
   * @async
   * @param {number} messageID - Идентификатор сообщения, для которого нужно получить контент.
   * @returns {Promise<Content[]>} Возвращает промисс, который разрешается в массив объектов контента, связанного с указанным идентификатором сообщения.
   * @throws {Error} Если не удается получить контент из базы данных.
   */
  async getContentByMessageId(messageID: number): Promise<Content[]> {
    const content = await this.prisma.content.findMany({
      where: {
        messageID,
      },
    });
    return content;
  }
}
