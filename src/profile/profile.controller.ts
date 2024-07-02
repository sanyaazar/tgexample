import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Res,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Response } from 'express';
import { ChangeProfileBodyDTO, GetUserProfileResDTO } from 'src/types';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { UpdateUserProfileResDTO } from 'src/types/response-dto/update-user-profile-res.dto';

@ApiExtraModels(GetUserProfileResDTO, UpdateUserProfileResDTO)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({
    tags: ['Profile'],
    summary: 'Get own profile',
    description: 'User get his/her own profile',
  })
  @ApiResponse({
    status: 200,
    description: "Returns user's profile",
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(GetUserProfileResDTO),
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getProfile(@Res() res: Response) {
    // return my profile
    return res.sendStatus(200);
  }

  @ApiOperation({
    tags: ['Profile'],
    summary: 'Edit profile information',
    description: 'User can edits telephone, date of birth and display name.',
    requestBody: {
      description: 'User data to change',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ChangeProfileBodyDTO',
          },
        },
      },
    },
  })
  @ApiBody({
    type: ChangeProfileBodyDTO,
    examples: {
      example1: {
        value: {
          login: 'ivanov',
          tel: '+79991234567',
        },
      },
      example2: {
        value: {
          login: 'ivanov',
          tel: '+79991234567',
          dateOfBirth: '01.01.2003',
        },
      },
      example3: {
        value: {
          login: 'ivanov',
          tel: '+79991234567',
          dateOfBirth: '01.01.2003',
          displayName: 'Ivan Ivanov',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Returns user's updated information",
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(UpdateUserProfileResDTO),
        },
        examples: {
          example1: {
            value: {
              login: 'ivanov',
              tel: '+79991234567',
            },
          },
          example2: {
            value: {
              login: 'ivanov',
              tel: '+79991234567',
              dateOfBirth: '01.01.2003',
            },
          },
          example3: {
            value: {
              login: 'ivanov',
              tel: '+79991234567',
              dateOfBirth: '01.01.2003',
              displayName: 'Ivan Ivanov',
            },
          },
        },
      },
    },
  })
  @Put()
  async changeProfileData(
    @Body() body: ChangeProfileBodyDTO,
    @Res() res: Response,
  ) {
    const { login, ...params } = body;
    return res.status(200).send(params);
  }
}
