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
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({
    tags: ['Contacts'],
    summary: 'Get all contacts',
    description: 'The user gets the list of contacts.',
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
  @HttpCode(HttpStatus.OK)
  async addContact(@Body('userID') userID: string, @Res() res: Response) {
    return res.status(200).send(userID);
  }
}
