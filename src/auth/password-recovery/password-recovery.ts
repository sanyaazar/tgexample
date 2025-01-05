import { Hasher } from '../hasher';
import { PasswordRecoveryDTO } from './password-recovery.dto';

export class PasswordRecovery {
  public readonly userID: number;
  public readonly code: string;
  public readonly expiresAt: Date;

  constructor(
    state: PasswordRecoveryDTO,
    private readonly hasher: Hasher,
  ) {
    this.userID = state.userID;
    this.code = state.code;
    this.expiresAt = state.expiresAt;
  }

  /**
   * Создает объект PasswordRecovery.
   * @param {number} userID - Идентификатор пользователя.
   * @param {Hasher} hasher - Объект для хеширования паролей.
   * @returns {PasswordRecovery} - Созданный объект PasswordRecovery.
   */
  public static create(
    userID: number,
    code: string,
    expiresAt: Date,
    hasher: Hasher,
  ): PasswordRecovery {
    return new PasswordRecovery(
      {
        userID,
        code,
        expiresAt,
      },
      hasher,
    );
  }

  /**
   * Сравнивает введенный код с сохраненным кодом на восстановление пароля.
   * @param {string} code - Введенный код на восстановление пароля.
   * @returns {Promise<boolean>} - Результат сравнения: true, если коды совпадают, иначе false.
   */
  public async compareCode(code: string): Promise<boolean> {
    return this.hasher.compare(code, this.code);
  }

  /**
   * Сравнивает текущее время с временем истечения для определения действительности кода.
   * @returns {boolean} - Результат сравнения: true, если текущее время меньше времени истечения, иначе false.
   */
  public compareTime(): boolean {
    return new Date() < this.expiresAt;
  }
}
