import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получает сообщение по его идентификатору.
   * @param {number} messageID - Идентификатор сообщения.
   * @returns {Promise<Message | null>} - Промис, который разрешается объектом сообщения или значением null, если сообщение не найдено.
   */
  public async getMessageByID(messageID: number): Promise<Message | null> {
    return await this.prisma.message.findFirst({
      where: {
        messageID,
      },
    });
  }
}
