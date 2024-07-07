import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AuthLoginLocalBodyDTO,
  AuthRegisterBodyDTO,
  AuthRegisterResDTO,
  EmailValidationBodyDTO,
  EmailValidationConfirmDTO,
} from 'src/types';
import { Hasher } from './hasher';
import { JwtService } from '@nestjs/jwt';
import { TokenGenerator } from './tokenGenerator';
import { EmailService } from 'src/email/email.service';
import * as generatePassword from 'generate-password';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenGenerator: TokenGenerator,
    private readonly hasher: Hasher,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Регистрирует нового пользователя в системе.
   *
   * @param input - Данные регистрации нового пользователя.
   * @returns Промис объекта с токенами доступа при успешной авторизации.
   * @throws `ConflictException`, если пользователь с таким логином уже существует.
   */
  public async register(
    input: AuthRegisterBodyDTO,
  ): Promise<AuthRegisterResDTO> {
    // Шаг 1: Проверка уникальности предоставленного логина, email и номера телефона
    await this.checkUniqueFields(input);

    // Шаг 2: Создание новой записи пользователя в базе данных
    const user = await this.prisma.user.create({
      data: {
        login: input.login,
        password: await this.hashPassword(input.password),
        tel: input.tel,
        email: input.email,
        displayName: input.displayName ?? input.login,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      },
    });

    // Шаг 3: Генерация JWT токенов для нового зарегистрированного пользователя
    if (user) {
      const payload = { id: user.userID, login: user.login };
      const tokens = await this.tokenGenerator.generateTokens(payload);
      return tokens;
    } else {
      throw new ConflictException('User creation error');
    }
  }

  /**
   * Авторизует пользователя локально (по логину и паролю).
   *
   * @param input - Данные для авторизации пользователя.
   * @returns Промис объекта с токенами доступа при успешной авторизации.
   * @throws `UnauthorizedException`, если предоставлены неверные логин или пароль.
   */
  public async localLogin(
    input: AuthLoginLocalBodyDTO,
  ): Promise<AuthRegisterResDTO> {
    let isValidPassword = false;

    // Шаг 1: Поиск пользователя по предоставленному логину
    const existedUser = await this.prisma.user.findFirst({
      where: { login: input.login },
    });

    // Шаг 2: Проверка валидности пароля, если пользователь найден
    if (existedUser)
      isValidPassword = await this.hasher.compare(
        input.password,
        existedUser.password,
      );
    if (!(isValidPassword && existedUser))
      throw new UnauthorizedException('Invalid login or password');
    // Шаг 3: Генерация JWT токенов для авторизованного пользователя
    const payload = { id: existedUser.userID, login: existedUser.login };
    const tokens = await this.tokenGenerator.generateTokens(payload);
    return tokens;
  }

  /**
   * Восстановление доступа к аккаунту по email.
   *
   * @param input - Данные для восстановления доступа.
   * @returns Промис, который разрешается true при успешной отправке кода восстановления.
   * @throws `ConflictException`, если пользователь с таким email не найден.
   */
  public async recoveryByEmail(
    input: EmailValidationBodyDTO,
  ): Promise<boolean> {
    // Шаг 1: Поиск пользователя по email
    const user = await this.prisma.user.findFirst({
      where: {
        email: input.email,
      },
      select: {
        userID: true, // Указываем, что хотим получить поле userID
      },
    });
    // Шаг 2: Если пользователь найден, генерируем код восстановления
    if (user) {
      const code = generatePassword.generate({
        length: 6,
        numbers: true,
        symbols: false, // Отключаем стандартные специальные символы
        uppercase: true, // Включаем заглавные буквы
        excludeSimilarCharacters: true, // Исключаем похожие символы, например, l и 1
        strict: true, // Строгое соблюдение всех правил
      });
      // Шаг 3: Проверяем, есть ли уже запись о коде восстановления для данного пользователя
      const alreadyRecoveryUser =
        await this.prisma.recoveryCodesByEmail.findFirst({
          where: {
            userID: user.userID,
          },
          select: {
            userID: true,
          },
        });
      // Шаг 4: Обновляем или создаем запись о коде восстановления
      if (alreadyRecoveryUser) {
        await this.prisma.recoveryCodesByEmail.update({
          where: { userID: alreadyRecoveryUser.userID },
          data: {
            code: await this.hashPassword(code),
            finishedAt: new Date(new Date().getTime() + 5 * 60000),
          },
        });
      } else {
        await this.prisma.recoveryCodesByEmail.create({
          data: {
            userID: user.userID,
            code: await this.hashPassword(code),
            finishedAt: new Date(new Date().getTime() + 5 * 60000),
          },
        });
      }
      // Шаг 5: Отправляем код восстановления на email пользователя
      const result = await this.emailService.sendEmail(
        input.email,
        'Recovery password',
        code,
      );
      return true;
    } else throw new ConflictException(`User with such email doesnt exist`);
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
  ): Promise<boolean> {
    // Шаг 1: Поиск записи о коде восстановления для пользователя по email
    const recoveryUser = await this.prisma.recoveryCodesByEmail.findFirst({
      where: {
        user: {
          email: input.email,
        },
      },
      select: {
        user: {
          select: {
            userID: true,
          },
        },
        code: true,
        finishedAt: true,
      },
    });
    // Шаг 2: Проверка существования записи и соответствия кода и времени
    if (recoveryUser) {
      const codeMatches = await this.hasher.compare(
        input.code,
        recoveryUser.code,
      );
      const timeMatches =
        new Date().getTime() < recoveryUser.finishedAt.getTime();
      // Шаг 3: Если код и время совпадают, обновляем пароль пользователя
      if (codeMatches && timeMatches) {
        const result = await this.prisma.user.update({
          where: {
            userID: recoveryUser.user.userID,
          },
          data: {
            password: await this.hashPassword(input.password),
          },
        });
        // Шаг 4: Если обновление пароля успешно, удаляем запись о восстановлении,
        // возвращаем true
        if (result) {
          const result = await this.prisma.recoveryCodesByEmail.delete({
            where: {
              userID: recoveryUser.user.userID,
            },
          });
          if (result) return true;
        }
      }
    }
    // Шаг 5: В случае неудачи, выбрасываем исключение
    throw new BadRequestException('Password change error.');
  }

  // Private Methods

  private async hashPassword(password: string): Promise<string> {
    const result = this.hasher.hash(password);
    return result;
  }

  private async checkUniqueFields(input: AuthRegisterBodyDTO): Promise<void> {
    await this.checkLoginIsUnique(input.login);
    await this.checkEmailIsUnique(input.email);
    await this.checkPhoneIsUnique(input.tel);
  }

  private async checkLoginIsUnique(login: string): Promise<void> {
    const existing = await this.prisma.user.findFirst({
      where: { login },
      select: { userID: true },
    });
    if (existing) {
      throw new ConflictException(`User with such login already exists`);
    }
  }

  private async checkEmailIsUnique(email: string): Promise<void> {
    const existing = await this.prisma.user.findFirst({
      where: { email },
      select: { userID: true },
    });
    if (existing) {
      throw new ConflictException(`User with such email already exists`);
    }
  }
  private async checkPhoneIsUnique(tel: string): Promise<void> {
    const existing = await this.prisma.user.findFirst({
      where: { tel },
      select: { userID: true },
    });
    if (existing) {
      throw new ConflictException(`User with such phone number already exists`);
    }
  }
}
