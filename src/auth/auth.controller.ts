import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  AuthLoginLocalBodyDTO,
  AuthRegisterBodyDTO,
  EmailValidationBodyDTO,
  EmailValidationConfirmDTO,
} from 'src/types';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Creates a new user',
    description:
      'Registers a new user by providing login, password, email (optional: tel, date of birth, display name)',
    requestBody: {
      description: 'User data for registration',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/AuthRegisterBodyDTO',
          },
        },
      },
    },
  })
  async createUser(@Body() body: AuthRegisterBodyDTO) {
    return body;
  }

  @Post('login/local')
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Local login',
    description: 'The user logs into the service using login and password.',
    requestBody: {
      description: 'User data for sign in',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/AuthLoginLocalBodyDTO',
          },
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async localLogin(@Body() body: AuthLoginLocalBodyDTO, @Res() res: Response) {
    return res.status(200).send(body);
  }

  @Post('recovery/email')
  @ApiOperation({
    tags: ['Recovery'],
    summary: 'Recovery using email',
    description: 'The user recovery account using email.',
    requestBody: {
      description: "User's email for recovery",
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/EmailValidationBodyDTO',
          },
        },
      },
    },
  })
  @ApiBody({
    type: EmailValidationBodyDTO,
    examples: {
      example1: {
        value: {
          email: 'a@google.com',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async recoveryByEmail(
    @Body() body: EmailValidationBodyDTO,
    @Res() res: Response,
  ) {
    return res.sendStatus(200);
  }

  @Post('recovery/email/confirmation')
  @ApiOperation({
    tags: ['Recovery'],
    summary: 'Confirm recovery',
    description: 'The user sends new password after getting recovery url',
    requestBody: {
      description: "User's email for recovery",
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/EmailValidationConfirmDTO',
          },
        },
      },
    },
  })
  @ApiBody({
    type: EmailValidationConfirmDTO,
    examples: {
      example1: {
        value: {
          email: 'a@google.com',
          password: 'StrongPassword123',
          code: 'TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdC',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async recoveryByEmailConfirm(
    @Body() body: EmailValidationConfirmDTO,
    @Res() res: Response,
  ) {
    return res.sendStatus(200);
  }
}
