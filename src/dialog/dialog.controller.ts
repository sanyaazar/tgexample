import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
  Request,
  UploadedFile,
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
import { AuthGuard } from 'src/auth/auth.guard';

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
    description: 'Returns the users with whom there is a dialog',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the users with whom there is a dialog',
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(GetUserDialogsDTO),
        },
        example: {
          usersWithDialog: ['212131', '112312'],
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getAllDialogs(@Request() req, @Res() res: Response) {
    const result = await this.dialogService.getAllDialogs(req.user.id);
    if (result) res.send(result);
  }

  @Get(':userLogin')
  @ApiOperation({
    tags: ['Dialog'],
    summary: 'Get dialog',
    description: 'The user gets the specific dialog (list of messages).',
  })
  @ApiParam({
    name: 'userLogin',
    description: 'Login user whom dialog is',
    type: 'string',
    example: 'admin',
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
    @Request() req,
    @Param('userLogin') userLogin: string,
    @Res() res: Response,
  ) {
    const result = await this.dialogService.getDialogByID(
      +req.user.id,
      userLogin,
    );
    if (result) return res.send(result);
  }

  @Post(':userLogin')
  @ApiOperation({
    tags: ['Dialog'],
    summary: 'Send a message',
    description: 'The user sends a message to another user in dialog.',
  })
  @ApiParam({
    name: 'userLogin',
    description: 'UserLogin',
    type: 'number',
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
    @Request() req,
    @Param('userLogin') userLogin: string,
    @Body() body: SendMessageBodyDTO,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const result = await this.dialogService.sendMessage(
      +req.user.id,
      userLogin,
      body.messageText,
      file,
    );
    if (result) return res.send(result);
  }
}
