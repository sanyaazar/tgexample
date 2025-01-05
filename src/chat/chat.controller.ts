import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
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
  addUserToChatBodyDTO,
  csvBody,
  GetChatIDResDTO,
  GetNewMessageResID,
  SendMessageBodyDTO,
} from 'src/types';
import {
  chatCreateBody,
  CreateChatBodyDTO,
} from 'src/types/request-dto/create-chat-body.dto';
import { GetChatMessagesResDTO } from 'src/types/response-dto/get-chat-messages-res.dto';

@Controller('chat')
@ApiExtraModels(
  CreateChatBodyDTO,
  GetChatIDResDTO,
  addUserToChatBodyDTO,
  GetChatMessagesResDTO,
)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  @ApiBody(chatCreateBody)
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    tags: ['Chat'],
    summary: 'Creates a new chat',
    description: "Registers a new chat by providing member's login",
  })
  @ApiResponse({
    status: 201,
    description: 'Return a new chat ID',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetChatIDResDTO',
        },
      },
    },
  })
  async createChat(
    @Body() body: CreateChatBodyDTO,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const result = await this.chatService.createChat(+req.user.id, body, file);
    if (result) return res.status(201).send(result);
  }

  @Get(':chatID')
  @ApiOperation({
    tags: ['Chat'],
    summary: 'Get messages from chat by chat ID',
    description: 'Returns messages from chat by providing chat ID',
  })
  @ApiParam({
    name: 'chatID',
    description: 'Chat ID',
    type: 'string',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: "Return chat's messages",
    content: {
      'application/json': {
        example: {
          messages: [
            {
              messageID: 5,
              messageText: 'Всем привет, это василий',
              userID: 3,
              sendAt: '2024-07-07T11:20:30.930Z',
            },
            {
              messageID: 6,
              messageText: 'Как у вас дела',
              userID: 3,
              sendAt: '2024-07-07T11:22:15.199Z',
            },
          ],
        },
      },
    },
  })
  async getChatByID(
    @Request() req,
    @Param('chatID') chatID: string,
    @Res() res: Response,
  ) {
    const result = await this.chatService.getChatByID(+req.user.id, +chatID);
    if (result) return res.send(result);
  }

  @Post(':chatID')
  @ApiOperation({
    tags: ['Chat'],
    summary: 'Send a message to chat',
    description: 'The user sends a message to chat.',
  })
  @ApiParam({
    name: 'chatID',
    description: 'Chat ID',
    type: 'string',
    example: '1',
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
          messageID: '10',
        },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Request() req,
    @Param('chatID') chatID: string,
    @Body() body: SendMessageBodyDTO,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const result = await this.chatService.sendMessage(
      +req.user.id,
      +chatID,
      body.messageText,
      file,
    );
    if (result) return res.send(result);
  }

  @Post('add/:chatID')
  @ApiOperation({
    tags: ['Chat'],
    summary: 'Add user to chat',
    description: 'Add user to chat providing his login if the adder is admin.',
    requestBody: {
      description: 'User login',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/addUserToChatBodyDTO',
          },
        },
      },
    },
  })
  @ApiParam({
    name: 'chatID',
    description: 'Chat ID',
    type: 'string',
    example: '1',
  })
  @ApiResponse({
    status: 201,
    description: 'Return status of adding',
  })
  @HttpCode(HttpStatus.OK)
  async addUserToChat(
    @Request() req,
    @Param('chatID') chatID: string,
    @Body() body: addUserToChatBodyDTO,
    @Res() res: Response,
  ) {
    await this.chatService.addUserToChat(+req.user.id, body.userLogin, +chatID);
    return res.sendStatus(200);
  }

  @Delete('kick/:chatID')
  @ApiOperation({
    tags: ['Chat'],
    summary: 'Kick user from chat',
    description:
      'Kick user from chat providing his login if the kicker is admin.',
    requestBody: {
      description: 'User login',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/addUserToChatBodyDTO',
          },
        },
      },
    },
  })
  @ApiParam({
    name: 'chatID',
    description: 'Chat ID',
    type: 'string',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Return status of adding',
  })
  @HttpCode(HttpStatus.OK)
  async kickUserFromChat(
    @Request() req,
    @Param('chatID') chatID: string,
    @Body() body: addUserToChatBodyDTO,
    @Res() res: Response,
  ) {
    await this.chatService.kickUserFromChat(
      +req.user.id,
      body.userLogin,
      +chatID,
    );
    return res.sendStatus(200);
  }

  @Delete(':chatID')
  @ApiOperation({
    tags: ['Chat'],
    summary: 'Delete chat',
    description: 'Delete chat providing his id',
  })
  @ApiParam({
    name: 'chatID',
    description: 'Chat ID',
    type: 'string',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Return status of adding',
  })
  @HttpCode(HttpStatus.OK)
  async deleteChat(
    @Request() req,
    @Param('chatID') chatID: string,
    @Res() res: Response,
  ) {
    await this.chatService.deleteChat(+req.user.id, +chatID);
    return res.sendStatus(200);
  }
}
