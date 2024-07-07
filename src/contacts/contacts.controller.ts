import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  Request,
  Delete,
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
  async getAllContacts(@Request() req, @Res() res: Response) {
    const result = await this.contactsService.getAllContacts(+req.user.id);
    if (result) res.send(result);
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
        userLogin: {
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
  async addContact(
    @Request() req,
    @Body('userLogin') userLogin: string,
    @Res() res: Response,
  ) {
    const result = await this.contactsService.addContact(
      +req.user.id,
      userLogin,
    );
    if (result) return res.send(result);
  }

  @Delete()
  @ApiOperation({
    tags: ['Contacts'],
    summary: 'Delete contact',
    description: 'The user delete another user from list of contacts',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userLogin: {
          type: 'string',
          example: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns status of deleting contact (done/cancelled).',
  })
  @HttpCode(HttpStatus.OK)
  async deleteContact(
    @Request() req,
    @Body('userLogin') userLogin: string,
    @Res() res: Response,
  ) {
    const result = await this.contactsService.deleteContact(
      +req.user.id,
      userLogin,
    );
    return res.send(result);
  }
}
