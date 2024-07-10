import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Response } from 'express';
import {
  ChangeProfileBodyDTO,
  GetUserContactInfoResDTO,
  GetUserProfileResDTO,
} from 'src/types';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
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
  async getProfile(@Request() req, @Res() res: Response) {
    const result = await this.profileService.getProfile(req.user.login);
    if (result) res.send(result);
    else res.sendStatus(400);
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
          // login: 'ivanov',
          // tel: '+79991234567',
          dateOfBirth: '01.01.2003',
        },
      },
      example2: {
        value: {
          // login: 'ivanov',
          // tel: '+79991234567',
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
              // login: 'ivanov',
              // tel: '+79991234567',
              dateOfBirth: '01.01.2003',
            },
          },
          example2: {
            value: {
              // login: 'ivanov',
              // tel: '+79991234567',
              dateOfBirth: '01.01.2003',
              displayName: 'Ivan Ivanov',
            },
          },
        },
      },
    },
  })
  @Put()
  @HttpCode(HttpStatus.OK)
  async changeProfileData(
    @Request() req,
    @Body() body: ChangeProfileBodyDTO,
    @Res() res: Response,
  ) {
    const result = await this.profileService.changeProfileData(
      body,
      req.user.login,
    );
    if (result) {
      return res.send(result);
    }
  }

  @Get(':userLogin')
  @ApiOperation({
    tags: ['Profile'],
    summary: "Get user's profile",
    description: "The user gets the user's profile by providing userID",
  })
  @ApiParam({
    name: 'userLogin',
    description: 'User login to retrieve',
    type: 'string',
    example: '123456',
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns user's profile. If another user also have us in contacts, we will see all info.",
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(GetUserContactInfoResDTO),
        },
        examples: {
          example1: {
            description: 'Info if user also has us in contacts',
            value: {
              login: 'ivanov',
              tel: '+79991234567',
              email: 'ivanov@gmail.com',
              displayName: 'Ivan Ivanov',
              displayPhoto: 'file.png',
              dateOfBirth: '01.01.2003',
            },
          },
          example2: {
            description: "Info if user hasn't us in contacts",
            value: {
              login: 'ivanov',
              displayName: 'Ivan Ivanov',
              displayPhoto: 'file.png',
            },
          },
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getProfileByLogin(
    @Request() req,
    @Param('userLogin') userLogin: string,
    @Res() res: Response,
  ) {
    const result = await this.profileService.getUserProfileByLogin(
      +req.user.id,
      userLogin,
    );
    if (result) res.send(result);
  }
}
