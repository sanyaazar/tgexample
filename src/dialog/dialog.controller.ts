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
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  csvBody,
  GetNewMessageResID,
  GetUserDialogDTO,
  GetUserDialogsDTO,
  SendMessageBodyDTO,
} from 'src/types';

@ApiExtraModels(
  SendMessageBodyDTO,
  GetUserDialogDTO,
  GetUserDialogsDTO,
  GetNewMessageResID,
)
@Controller('dialogs')
export class DialogController {
  constructor(private readonly dialogService: DialogService) {}

  @Get()
  @ApiOperation({
    tags: ['Dialog'],
    summary: 'Get all dialogs',
    description: 'The user gets all his/her dialogs',
  })
  @ApiResponse({
    status: 200,
    description: "Return all user's dialog",
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(GetUserDialogsDTO),
        },
        example: {
          dialogsID: ['21b3h12b', '1b2j3b12j'],
        },
      },
    },
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
    example: 'bb88s7dfg2',
  })
  @ApiResponse({
    status: 200,
    description: "Return dialog's messages",
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(GetUserDialogDTO),
        },
        example: {
          messagesID: ['yd2312dad32', 'hd8f2u1'],
        },
      },
    },
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
  @ApiBody(csvBody)
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Return sent message ID',
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(GetNewMessageResID),
        },
        example: {
          messageID: '321jn312n',
        },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('dialogID') dialogID: string,
    @Body() body: SendMessageBodyDTO,
    @Res() res: Response,
  ) {
    return res.send({ messageID: 'd32123' });
  }
}
