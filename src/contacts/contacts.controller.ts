import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Response } from 'express';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { GetUserContactInfoResDTO, GetUserContactsResDTO } from 'src/types';

@ApiExtraModels(GetUserContactsResDTO, GetUserContactInfoResDTO)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({
    tags: ['Contacts'],
    summary: 'Get all contacts',
    description: 'The user gets the list of contacts.',
  })
  @ApiResponse({
    status: 200,
    description: "Returns all user's contacts.",
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(GetUserContactsResDTO),
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getAllContacts(@Res() res: Response) {
    return res.sendStatus(200);
  }

  @Get(':contactID')
  @ApiOperation({
    tags: ['Contacts'],
    summary: 'Get contact',
    description: "The user gets the contact's profile by providing userID",
  })
  @ApiParam({
    name: 'contactID',
    description: 'User ID to retrieve',
    type: 'string',
    example: '123456',
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns contact's profile. If another user also have us in contacts, we will see all info.",
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
  async getContactByID(
    @Param('contactID') contactID: string,
    @Res() res: Response,
  ) {
    return res.status(200).send(contactID);
  }

  @Post()
  @ApiOperation({
    tags: ['Contacts'],
    summary: 'Add contact',
    description: 'The user add another user to list of contacts',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userID: {
          type: 'string',
          example: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns status of adding contact (done/cancelled).',
  })
  @HttpCode(HttpStatus.OK)
  async addContact(@Body('userID') userID: string, @Res() res: Response) {
    return res.status(200).send(userID);
  }
}
