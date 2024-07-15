import { Injectable } from '@nestjs/common';
import { Session } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { createNewSessionDTO } from './dto';
import { CheckUserAgentSessionExist, GetSessionDTO } from 'src/types';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создает новую сессию.
   *
   * @param {createNewSessionDTO} session - Данные для создания новой сессии.
   * @returns {Promise<Session>} Промис, который разрешается объектом, представляющим новую сессию.
   */
  public async createNewSession(
    session: createNewSessionDTO,
  ): Promise<Session> {
    const createdSession = await this.prisma.session.create({
      data: {
        userID: session.userID,
        refreshToken: session.refreshToken,
        userAgent: session.userAgent,
        ip: session.ip,
        expiresAt: session.expiresAt,
      },
    });
    return createdSession;
  }

  public async checkIfUserAgentSessionExist(
    session: CheckUserAgentSessionExist,
  ): Promise<Session | null> {
    const existedSession = await this.prisma.session.findFirst({
      where: {
        userID: session.userID,
        userAgent: session.userAgent,
      },
    });
    return existedSession;
  }

  /**
   * Получает информацию о сессии пользователя.
   * @param {GetSessionDTO} session - Объект данных для получения информации о сессии.
   * @returns {Promise<Session|null>} - Обещание с информацией о сессии пользователя или null, если сессия не найдена.
   */
  public async getUserSession(session: GetSessionDTO): Promise<Session | null> {
    const foundedSession = await this.prisma.session.findFirst({
      where: {
        userID: session.userID,
        refreshToken: session.refreshToken,
        userAgent: session.userAgent,
      },
    });
    return foundedSession;
  }

  /**
   * Получает все сессии пользователя по идентификатору пользователя.
   *
   * @param {number} userID - Идентификатор пользователя, чьи сессии необходимо получить.
   * @returns {Promise<Session[]>} Промис, который разрешается массивом объектов с информацией о сессиях пользователя.
   */
  public async getUserSessions(userID: number): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userID,
      },
    });
    return sessions;
  }

  /**
   * Удаляет сессию пользователя по идентификатору сессии.
   *
   * @param {number} sessionID - Идентификатор сессии, которую необходимо удалить.
   * @returns {Promise<void>} Промис, который разрешается после удаления сессии.
   */
  public async deleteUserSession(sessionID: number): Promise<void> {
    await this.prisma.session.delete({
      where: {
        sessionID,
      },
    });
  }
}
