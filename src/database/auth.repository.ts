import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { RecoveryCodesByEmail, User } from '@prisma/client';
import { Hasher } from 'src/auth/hasher';
import { PasswordRecoveryDTO } from 'src/auth/password-recovery';
import { CreateUserDTO } from './dto';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hasher: Hasher,
  ) {}

  /**
   * Создает нового пользователя.
   *
   * @param {CreateUserDTO} user - Данные для создания пользователя.
   * @returns {Promise<User>} Промис, разрешающийся идентификатором созданного пользователя.
   */
  async createUser(user: CreateUserDTO): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        login: user.login,
        password: user.password,
        tel: user.tel,
        email: user.email,
        displayName: user.displayName ?? user.login,
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      },
    });
    return createdUser;
  }

  /**
   * Обновляет пароль пользователя по идентификатору пользователя.
   *
   * @param {number} userID - Идентификатор пользователя.
   * @param {string} password - Новый пароль пользователя.
   * @returns {Promise<void>} Промис, который разрешается в случае успешного обновления или null в случае неудачи.
   */
  async updateUserPasswordByID(
    userID: number,
    password: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        userID,
      },
      data: {
        password,
      },
    });
  }

  /**
   * Удаляет код восстановления по идентификатору пользователя.
   *
   * @param {number} userID - Идентификатор пользователя.
   * @returns {Promise<void>} Промис, который разрешается после удаления.
   */
  async deleteRecoveryCodeByUserID(userID: number): Promise<void> {
    await this.prisma.recoveryCodesByEmail.delete({
      where: {
        userID,
      },
    });
  }

  /**
   * Создает запись кода восстановления.
   *
   * @param {PasswordRecoveryDTO} data - Данные для создания записи кода восстановления.
   * @returns {Promise<void>} Промис, который разрешается после создания записи.
   */
  async createRecoveryCodeRow(data: PasswordRecoveryDTO): Promise<void> {
    await this.prisma.recoveryCodesByEmail.create({
      data,
    });
  }

  /**
   * Находит запись кода восстановления по email.
   *
   * @param {string} email - Email пользователя.
   * @returns {Promise<RecoveryCodesByEmail | null>} Промис, разрешающий найденную запись или null, если запись не найдена.
   */
  async findRecoveryCodeRowByEmail(
    email: string,
  ): Promise<RecoveryCodesByEmail | null> {
    const recoveryUser = await this.prisma.recoveryCodesByEmail.findFirst({
      where: {
        user: {
          email,
        },
      },
    });
    return recoveryUser;
  }
}
