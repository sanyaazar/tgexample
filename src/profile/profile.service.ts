import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ChangeProfileBodyDTO,
  GetUserContactInfoResDTO,
  GetUserProfileResDTO,
} from 'src/types';
import { UpdateUserProfileResDTO } from 'src/types/response-dto/update-user-profile-res.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получает профиль пользователя по логину.
   *
   * @param userLogin - Логин пользователя, профиль которого нужно получить.
   * @returns Объект профиля пользователя, содержащий login, email, tel, displayName, displayPhotoID и dateOfBirth.
   * @throws BadRequestException - Если пользователь не найден.
   */
  async getProfile(userLogin: string): Promise<GetUserProfileResDTO> {
    // const result = await this.prisma.user.findFirst({
    //   where: {
    //     login: userLogin,
    //   },
    //   select: {
    //     login: true,
    //     email: true,
    //     tel: true,
    //     displayName: true,
    //     displayPhotoID: true,
    //     dateOfBirth: true,
    //   },
    // });
    const result = await this.prisma.getUserByLogin(userLogin);
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
   * Обновляет профиль пользователя в базе данных.
   * @param infoToUpdate - Объект с данными для обновления профиля.
   * @param userLogin - Логин пользователя, чьи данные нужно обновить.
   * @returns Промис с объектом, содержащим обновленные данные профиля.
   * @throws {BadRequestException} Выбрасывает исключение, если пользователь не найден или произошла ошибка в процессе обновления.
   */
  async changeProfileData(
    infoToUpdate: ChangeProfileBodyDTO,
    userLogin: string,
  ): Promise<UpdateUserProfileResDTO> {
    const updatedUser = await this.prisma.user.update({
      where: {
        login: userLogin,
      },
      data: {
        ...(infoToUpdate.dateOfBirth && {
          dateOfBirth: new Date(infoToUpdate.dateOfBirth),
        }),
        ...(infoToUpdate.displayName && {
          displayName: infoToUpdate.displayName,
        }),
      },
      select: {
        dateOfBirth: infoToUpdate.dateOfBirth ? true : false,
        displayName: infoToUpdate.displayName ? true : false,
      },
    });
    if (updatedUser) {
      return {
        displayName: updatedUser.displayName || undefined,
        dateOfBirth: updatedUser.dateOfBirth || undefined,
      };
    } else {
      throw new BadRequestException();
    }
  }

  async getProfileByLogin(
    userID: number,
    contactLogin: string,
  ): Promise<GetUserContactInfoResDTO> {
    // Шаг 1. Получаем ID собеседника
    const contactID = await this.prisma.getUserIDByLogin(contactLogin);

    // Шаг 2. Если наш пользователь находится у него в контактах, то
    // наш пользователь получает полную информацию
    const isOurUserIsContact = await this.prisma.contact.findFirst({
      where: {
        contact1: contactID,
        contact2: userID,
      },
    });

    // Шаг 3. Возвращаем информацию пользователю
    const result = await this.prisma.user.findFirst({
      where: {
        userID: contactID,
      },
    });
    if (result) {
      return {
        login: result.login,
        tel: isOurUserIsContact ? result.tel : undefined,
        email: isOurUserIsContact ? result.email : undefined,
        displayName: result.displayName,
        // displayPhoto: result.displayPhotoID
        dateOfBirth: isOurUserIsContact
          ? result.dateOfBirth || undefined
          : undefined,
      };
    }
    throw new BadRequestException();
  }
}
