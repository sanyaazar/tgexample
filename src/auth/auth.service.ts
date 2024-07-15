import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthLoginLocalBodyDTO,
  AuthRegisterBodyDTO,
  AuthResDTO,
  EmailValidationBodyDTO,
  EmailValidationConfirmDTO,
} from 'src/types';
import * as generatePassword from 'generate-password';
import { Hasher } from './hasher';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { PasswordRecovery, PasswordRecoveryDTO } from './password-recovery';
import { AuthRepository, UserRepository } from 'src/database';
import { SessionService } from './session/session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hasher: Hasher,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
  ) {}

  public async register(input: AuthRegisterBodyDTO): Promise<number> {
    await this.checkUniqueFields(input);
    input.password = await this.hasher.hash(input.password);
    const createdUser = await this.authRepository.createUser(input);
    return createdUser.userID;
  }

  /**
   * Аутентификация пользователя локально.
   *
   * @param {AuthLoginLocalBodyDTO} input - Данные для аутентификации пользователя.
   * @param {string} ip - IP-адрес пользователя.
   * @param {string} userAgent - Строка User-Agent браузера пользователя.
   * @returns {Promise<AuthResDTO>} Промис, который разрешается объектом, содержащим информацию о регистрации пользователя.
   */
  public async localLogin(
    input: AuthLoginLocalBodyDTO,
    ip: string,
    userAgent: string,
  ): Promise<AuthResDTO> {
    const existedUser = await this.userRepository.getUserByLogin(input.login);
    if (!existedUser)
      throw new UnauthorizedException('Invalid login or password');
    const isValidPassword = await this.hasher.compare(
      input.password,
      existedUser.password,
    );
    if (!isValidPassword)
      throw new UnauthorizedException('Invalid login or password');
    const createdSession = await this.sessionService.createSession({
      userID: existedUser.userID,
      ip,
      userAgent,
    });
    return {
      access_token: createdSession.accessToken,
      refresh_token: createdSession.refreshToken,
    };
  }

  /**
   * Выполняет процедуру восстановления пароля по email.
   *
   * @param {EmailValidationBodyDTO} input - Входные данные для восстановления пароля по email.
   * @returns {Promise<boolean>} Промис, разрешающийся при успешном выполнении операции.
   * @throws {NotFoundException} Если пользователь с таким email не существует.
   */
  public async recoveryByEmail(input: EmailValidationBodyDTO): Promise<void> {
    const userID = await this.userRepository.getUserIDByEmail(input.email);
    if (!userID)
      throw new NotFoundException("User with this email doesn't exist");
    const code = this.generateCode();
    const passwordRecovery: PasswordRecoveryDTO = PasswordRecovery.create(
      userID,
      await this.hasher.hash(code),
      this.generateCodeDateExpiration(),
      this.hasher,
    );
    await this.authRepository.deleteRecoveryCodeByUserID(userID);
    await this.authRepository.createRecoveryCodeRow(passwordRecovery);
    // TODO: обернуть в try/catch
    await this.emailService.sendEmail(input.email, 'Recovery password', code);
  }

  /**
   * Подтверждение восстановления пароля по email.
   *
   * @param input - Данные для подтверждения восстановления пароля.
   * @returns Промис, который разрешается true при успешной смене пароля.
   * @throws `BadRequestException`, если код восстановления неверен или истек, либо произошла ошибка при смене пароля.
   */
  public async recoveryByEmailConfirm(
    input: EmailValidationConfirmDTO,
  ): Promise<void> {
    // Шаг 1: Поиск записи о коде восстановления для пользователя по email
    const recoveryUserDB = await this.authRepository.findRecoveryCodeRowByEmail(
      input.email,
    );
    if (!recoveryUserDB) throw new NotFoundException();
    const recoveryUser = PasswordRecovery.create(
      recoveryUserDB.userID,
      recoveryUserDB.code,
      recoveryUserDB.expiresAt,
      this.hasher,
    );
    if (
      recoveryUser.compareTime() &&
      (await recoveryUser.compareCode(input.code))
    ) {
      await this.authRepository.updateUserPasswordByID(
        recoveryUser.userID,
        await this.hasher.hash(input.password),
      );
      await this.authRepository.deleteRecoveryCodeByUserID(recoveryUser.userID);
    }
  }

  // Private Methods

  /**
   * Проверяет уникальность полей ввода при регистрации.
   *
   * @param {AuthRegisterBodyDTO} input - Вводная информация для регистрации.
   * @returns {Promise<void>} Промис, который не возвращает значения при успешной проверке уникальности.
   */
  private async checkUniqueFields(input: AuthRegisterBodyDTO): Promise<void> {
    await this.checkLoginIsUnique(input.login);
    await this.checkEmailIsUnique(input.email);
    await this.checkPhoneIsUnique(input.tel);
  }

  /**
   * Проверяет уникальность логина.
   *
   * @param {string} login - Логин, который необходимо проверить на уникальность.
   * @returns {Promise<void>} Промис, который не возвращает значения при успешной проверке уникальности.
   * @throws {ConflictException} Если пользователь с таким логином уже существует.
   */
  private async checkLoginIsUnique(login: string): Promise<void> {
    const existing = await this.userRepository.getUserByLogin(login);
    if (existing) {
      throw new ConflictException(`User with such login already exists`);
    }
  }

  /**
   * Проверяет уникальность email.
   *
   * @param {string} email - Адрес электронной почты, который необходимо проверить на уникальность.
   * @returns {Promise<void>} Промис, который не возвращает значения при успешной проверке уникальности.
   * @throws {ConflictException} Если пользователь с таким email уже существует.
   */
  private async checkEmailIsUnique(email: string): Promise<void> {
    const existing = await this.userRepository.getUserByEmail(email);
    if (existing) {
      throw new ConflictException(`User with such email already exists`);
    }
  }

  /**
   * Проверяет уникальность номера телефона.
   *
   * @param {string} tel - Номер телефона, который необходимо проверить на уникальность.
   * @returns {Promise<void>} Промис, который не возвращает значения при успешной проверке уникальности.
   * @throws {ConflictException} Если пользователь с таким номером телефона уже существует.
   */
  private async checkPhoneIsUnique(tel: string): Promise<void> {
    const existing = await this.userRepository.getUserByPhoneNumber(tel);
    if (existing) {
      throw new ConflictException(`User with such phone number already exists`);
    }
  }

  /**
   * Генерирует дату истечения срока действия кода.
   *
   * @returns {Date} Дата истечения срока действия кода.
   */
  public generateCodeDateExpiration(): Date {
    return new Date(
      new Date().getTime() +
        this.configService.get<number>('RECOVERY_CODE_DURATION')!,
    );
  }

  /**
   * Генерирует пароль с заданными параметрами, используя службу конфигурации.
   * @param {ConfigService} configService - Сервис конфигурации для получения параметров генерации пароля.
   * @returns {string} - Сгенерированный пароль.
   */
  public generateCode(): string {
    return generatePassword.generate({
      length: this.configService.get<number>('CODE_LENGTH'),
      numbers: this.configService.get<boolean>('CODE_NUMBERS'),
      symbols: this.configService.get<boolean>('CODE_SYMBOLS'),
      uppercase: this.configService.get<boolean>('CODE_UPPERCASE'),
      excludeSimilarCharacters: this.configService.get<boolean>(
        'CODE_EXCLUDESIMILARCHARACTERS',
      ),
      strict: this.configService.get<boolean>('CODE_STRICT'),
    });
  }
}
