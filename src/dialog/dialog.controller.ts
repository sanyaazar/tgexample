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
import { DialogService } from './dialog.service';
import { Response } from 'express';
import { SendMessageBodyDTO } from 'src/types';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('dialogs')
export class DialogController {
  constructor(private readonly dialogService: DialogService) {}

  @Get()
  @ApiOperation({
    tags: ['Dialog'],
    summary: 'Get all dialogs',
    description: 'The user gets all his/her dialogs',
  })
  @HttpCode(HttpStatus.OK)
  async getAllDialogs(@Res() res: Response) {
    return res.sendStatus(200);
  }

  @Get(':dialogID')
  @ApiOperation({
    tags: ['Dialog'],
    summary: 'Get dialog',
    description: 'The user gets the specific dialog.',
  })
  @ApiParam({
    name: 'dialogID',
    description: "Dialog's",
    type: 'string',
    example: '123456',
  })
  @HttpCode(HttpStatus.OK)
  async getDialogByID(
    @Param('dialogID') dialogID: string,
    @Res() res: Response,
  ) {
    return res.status(200).send(dialogID);
  }

  @Post(':dialogID')
  @ApiOperation({
    tags: ['Dialog'],
    summary: 'Send a message',
    description: 'The user sends a message in the specific dialog.',
  })
  @ApiParam({
    name: 'dialogID',
    description: "Dialog's ID",
    type: 'string',
    example: '123456',
  })
  @ApiBody({
    schema: {
      $ref: '#/components/schemas/SendMessageBodyDTO',
    },
    examples: {
      example1: {
        value: {
          messageText: 'Hello, dear friend!',
          file: 'i dont know what to write',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Param('dialogID') dialogID: string,
    @Body() body: SendMessageBodyDTO,
    @Res() res: Response,
  ) {
    return res.status(200).send({ ...body, dialogID });
  }
}
