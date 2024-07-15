import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatedSessionDTO } from 'src/database/dto';
import { SessionRepository } from 'src/database/session.repository';
import { TokenGenerator } from '../tokenGenerator';
import {
  AuthResDTO,
  CreateSessionDTO,
  GeneratedTokenDTO,
  LogoutSessionDTO,
  UpdateRefreshTokenDTO,
} from 'src/types';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  /**
   * Создает новую сессию для пользователя.
   * @param {CreateSessionDTO} session - Объект данных для создания сессии.
   * @returns {Promise<CreatedSessionDTO>} - Объект, представляющий созданную сессию.
   */
  async createSession(session: CreateSessionDTO): Promise<CreatedSessionDTO> {
    const ifUserSessionExist =
      await this.sessionRepository.checkIfUserAgentSessionExist({
        userID: session.userID,
        userAgent: session.userAgent,
      });

    if (ifUserSessionExist) {
      await this.sessionRepository.deleteUserSession(
        ifUserSessionExist.sessionID,
      );
    }

    const tokens: GeneratedTokenDTO = await this.tokenGenerator.generateTokens({
      id: session.userID,
    });

    const createdSession = await this.sessionRepository.createNewSession({
      userID: session.userID,
      refreshToken: tokens.refresh_token,
      userAgent: session.userAgent,
      ip: session.ip,
      expiresAt: tokens.exp,
    });
    return {
      sessionID: createdSession.sessionID,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
    };
  }

  /**
   * Выход пользователя из сессии.
   * @param {LogoutSessionDTO} session - Объект данных для выхода из сессии.
   * @returns {Promise<void>} - Обещание без возврата значения.
   * @throws {NotFoundException} - Исключение, если сессия не существует.
   */
  async logout(session: LogoutSessionDTO): Promise<void> {
    const userSession = await this.sessionRepository.getUserSession({
      userID: session.userID,
      refreshToken: session.refreshToken,
      userAgent: session.userAgent,
    });
    if (!userSession) throw new NotFoundException("Session doesn't exist");
    await this.sessionRepository.deleteUserSession(userSession.sessionID);
  }

  /**
   * Обновляет токены обновления для сессии пользователя.
   * @param {UpdateRefreshTokenDTO} session - Объект данных для обновления токенов обновления.
   * @returns {Promise<AuthResDTO>} - Обещание с данными обновленных токенов доступа и обновления.
   */
  async updateRefreshTokens(
    session: UpdateRefreshTokenDTO,
  ): Promise<AuthResDTO> {
    const userSession = await this.sessionRepository.getUserSession({
      userID: session.userID,
      refreshToken: session.refreshToken,
      userAgent: session.userAgent,
    });
    if (!userSession) throw new NotFoundException("This session doesn't exist");
    if (userSession.expiresAt < new Date())
      throw new NotFoundException("This session doesn't exist");

    await this.sessionRepository.deleteUserSession(userSession.sessionID);

    const createdSession = await this.createSession({
      userID: session.userID,
      ip: session.ip,
      userAgent: session.userAgent,
    });
    return {
      access_token: createdSession.accessToken,
      refresh_token: createdSession.refreshToken,
    };
  }
}
