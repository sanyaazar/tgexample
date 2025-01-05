import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangeProfileBodyDTO } from 'src/types';
import { CreateChatBodyDTO } from 'src/types/request-dto/create-chat-body.dto';
import { UpdateUserProfileResDTO } from 'src/types/response-dto/update-user-profile-res.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить пользователя по его ID
   * @param {number} userID - ID пользователя
   * @returns {Promise<User | null>} - Объект пользователя или null, если пользователь не найден
   */
  public async getUserByID(userID: number): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        userID,
      },
    });
    return user;
  }

  /**
   * Получает идентификатор пользователя по логину.
   *
   * @param {string} userLogin - Логин пользователя.
   * @returns {Promise<number | null>} Промис, разрешающий идентификатор пользователя или null, если пользователь не найден.
   */
  async getUserIDByLogin(userLogin: string): Promise<number | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        login: userLogin,
      },
      select: {
        userID: true,
      },
    });
    return user ? user.userID : null;
  }

  /**
   * Получает пользователя по логину.
   *
   * @param {string} userLogin - Логин пользователя.
   * @returns {Promise<User | null>} Промис, разрешающий найденного пользователя или null, если пользователь не найден.
   */
  async getUserByLogin(userLogin: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        login: userLogin,
      },
    });
    return user || null;
  }

  /**
   * Получает пользователя по email.
   *
   * @param {string} userEmail - Email пользователя.
   * @returns {Promise<User | null>} Промис, разрешающий найденного пользователя или null, если пользователь не найден.
   */
  async getUserByEmail(userEmail: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: userEmail,
      },
    });
    return user || null;
  }

  /**
   * Получает пользователя по номеру телефона.
   *
   * @param {string} userPhoneNumber - Номер телефона пользователя.
   * @returns {Promise<User | null>} Промис, разрешающий найденного пользователя или null, если пользователь не найден.
   */
  async getUserByPhoneNumber(userPhoneNumber: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        tel: userPhoneNumber,
      },
    });
    return user || null;
  }

  /**
   * Получает идентификатор пользователя по email.
   *
   * @param {string} userEmail - Email пользователя.
   * @returns {Promise<number | null>} Промис, разрешающий идентификатор пользователя или null, если пользователь не найден.
   */
  async getUserIDByEmail(userEmail: string): Promise<number | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: userEmail,
      },
      select: {
        userID: true, // Указываем, что хотим получить поле userID
      },
    });
    return user ? user.userID : null;
  }

  /**
   * Получить ID пользователей по их логинам
   * @param {CreateChatBodyDTO} chatMembers - Объект с данными участников чата
   * @returns {Promise<{ userID: number }[]>} - Массив объектов с ID пользователей
   */
  public async getUsersIDByLogin(
    users: CreateChatBodyDTO,
  ): Promise<{ userID: number }[]> {
    return await this.prisma.user.findMany({
      where: { login: { in: users.userLogins } },
      select: { userID: true },
    });
  }

  /**
   * Обновить информацию о пользователе
   * @param {number} userID - ID пользователя
   * @param {ChangeProfileBodyDTO} infoToUpdate - Объект с информацией для обновления профиля
   * @returns {Promise<UpdateUserProfileResDTO | null>} - Объект с обновленной информацией или null, если пользователь не найден
   */
  public async updateUserInfo(
    userID: number,
    infoToUpdate: ChangeProfileBodyDTO,
  ): Promise<UpdateUserProfileResDTO | null> {
    const updatedUser = await this.prisma.user.update({
      where: {
        userID,
      },
      data: {
        ...(infoToUpdate.dateOfBirth && {
          dateOfBirth: new Date(infoToUpdate.dateOfBirth),
        }),
        ...(infoToUpdate.displayName && {
          displayName: infoToUpdate.displayName,
        }),
      },
    });
    if (updatedUser) {
      return {
        displayName: updatedUser.displayName || undefined,
        dateOfBirth: updatedUser.dateOfBirth || undefined,
      };
    } else {
      return null;
    }
  }
}
