import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContactRepository, UserRepository } from 'src/database';
import {
  ChangeProfileBodyDTO,
  GetUserContactInfoResDTO,
  GetUserProfileResDTO,
} from 'src/types';
import { UpdateUserProfileResDTO } from 'src/types/response-dto/update-user-profile-res.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly contactRepository: ContactRepository,
  ) {}

  /**
   * Получает профиль пользователя по логину.
   *
   * @param userLogin - Логин пользователя, профиль которого нужно получить.
   * @returns Объект профиля пользователя, содержащий login, email, tel, displayName, displayPhotoID и dateOfBirth.
   * @throws BadRequestException - Если пользователь не найден.
   */
  async getProfile(userLogin: string): Promise<GetUserProfileResDTO> {
    const result = await this.userRepository.getUserByLogin(userLogin);
    if (result) {
      return {
        login: result.login,
        email: result.email,
        tel: result.tel,
        displayName: result.displayName || undefined,
        displayPhotoID: result.displayPhotoID || undefined,
        dateOfBirth: result.dateOfBirth || undefined,
      };
    } else throw new BadRequestException();
  }

  /**
   * Изменить данные профиля пользователя
   * @param {ChangeProfileBodyDTO} infoToUpdate - Объект с информацией для обновления профиля
   * @param {string} userLogin - Логин пользователя
   * @returns {Promise<UpdateUserProfileResDTO>} - Объект с обновленной информацией профиля
   * @throws {NotFoundException} - Если пользователь с указанным логином не найден
   * @throws {BadRequestException} - Если обновление не удалось
   */
  async changeProfileData(
    infoToUpdate: ChangeProfileBodyDTO,
    userLogin: string,
  ): Promise<UpdateUserProfileResDTO> {
    const userID = await this.userRepository.getUserIDByLogin(userLogin);
    if (!userID)
      throw new NotFoundException("User with this login doesn't exist");
    const updatedUser = await this.userRepository.updateUserInfo(
      userID,
      infoToUpdate,
    );
    if (updatedUser) return updatedUser;
    throw new BadRequestException();
  }

  /**
   * Получить информацию контакта по его логину
   * @param {number} userID - ID пользователя
   * @param {string} contactLogin - Логин контакта
   * @returns {Promise<GetUserContactInfoResDTO>} - Объект с информацией контакта
   * @throws {NotFoundException} - Если контакт с указанным логином не найден
   */
  async getUserProfileByLogin(
    userID: number,
    contactLogin: string,
  ): Promise<GetUserContactInfoResDTO> {
    // Шаг 1. Получаем ID собеседника
    const contact = await this.userRepository.getUserByLogin(contactLogin);
    if (!contact)
      throw new NotFoundException("User with this login doesn't exist");
    // Шаг 2. Если наш пользователь находится у него в контактах, то
    // наш пользователь получает полную информацию
    const isOurUserIsContact = await this.contactRepository.isUserContact(
      contact.userID,
      userID,
    );

    return {
      login: contact.login,
      tel: isOurUserIsContact ? contact.tel : undefined,
      email: isOurUserIsContact ? contact.email : undefined,
      displayName: contact.displayName,
      // displayPhoto: result.displayPhotoID
      dateOfBirth: isOurUserIsContact
        ? contact.dateOfBirth || undefined
        : undefined,
    };
  }

  /**
   * Получить информацию контакта по его логину
   * @param {number} userID - ID пользователя
   * @param {number} contactID - ID контакта
   * @returns {Promise<GetUserContactInfoResDTO>} - Объект с информацией контакта
   * @throws {NotFoundException} - Если контакт с указанным ID не найден
   */
  async getUserProfileByID(
    userID: number,
    contactID: number,
  ): Promise<GetUserContactInfoResDTO> {
    const contact = await this.userRepository.getUserByID(contactID);
    if (!contact) throw new NotFoundException("User doesn't exist");
    // Шаг 2. Если наш пользователь находится у него в контактах, то
    // наш пользователь получает полную информацию
    const isOurUserIsContact = await this.contactRepository.isUserContact(
      contactID,
      userID,
    );

    return {
      login: contact.login,
      tel: isOurUserIsContact ? contact.tel : undefined,
      email: isOurUserIsContact ? contact.email : undefined,
      displayName: contact.displayName,
      // displayPhoto: result.displayPhotoID
      dateOfBirth: isOurUserIsContact
        ? contact.dateOfBirth || undefined
        : undefined,
    };
  }
}
