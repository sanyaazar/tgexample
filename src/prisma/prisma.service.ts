import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Получает идентификатор пользователя по его логину.
   *
   * @param {string} userLogin - Логин пользователя, для которого необходимо получить идентификатор.
   * @returns {Promise<number>} Промис, возвращающий идентификатор пользователя.
   * @throws {BadRequestException} Выбрасывается, если пользователь с указанным логином не найден.
   */
  async getUserIDByLogin(userLogin: string): Promise<number> {
    const user = await this.user.findFirst({
      where: {
        login: userLogin,
      },
      select: {
        userID: true,
      },
    });

    if (user) {
      return user.userID;
    } else {
      throw new BadRequestException();
    }
  }

  /**
   * Получает пользователя по его логину.
   *
   * @param {string} userLogin - Логин пользователя, для которого необходимо получить информацию.
   * @returns {Promise<User>} Промис, возвращающий объект пользователя.
   * @throws {BadRequestException} Выбрасывается, если пользователь с указанным логином не найден.
   */
  async getUserByLogin(userLogin: string): Promise<User> {
    const user = await this.user.findFirst({
      where: {
        login: userLogin,
      },
    });
    if (user) {
      return user;
    } else {
      throw new BadRequestException();
    }
  }
}
