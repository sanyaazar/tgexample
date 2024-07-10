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
  authRegisterBody,
  AuthRegisterBodyDTO,
  AuthRegisterResDTO,
  EmailValidationBodyDTO,
  EmailValidationConfirmDTO,
  Public,
} from 'src/types';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('auth')
@ApiExtraModels(AuthRegisterResDTO)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiBody(authRegisterBody)
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Creates a new user',
    description:
      'Registers a new user by providing login, password, email (optional: tel, date of birth, display name)',
  })
  @ApiResponse({
    status: 201,
    description: 'Return a pair of access and refresh tokens',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/AuthRegisterResDTO',
        },
      },
    },
  })
  async createUser(@Body() body: AuthRegisterBodyDTO, @Res() res: Response) {
    const result = await this.authService.register(body);
    return res.status(201).send(result);
  }

  @Post('login/local')
  @Public()
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
  @ApiResponse({
    status: 200,
    description: 'Return a pair of access and refresh tokens',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/AuthRegisterResDTO',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async localLogin(@Body() body: AuthLoginLocalBodyDTO, @Res() res: Response) {
    const result = await this.authService.localLogin(body);
    return res.status(200).send(result);
  }

  @Post('recovery/email')
  @Public()
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
  @ApiResponse({
    status: 200,
    description: 'Returns status of sending email (done/cancelled)',
  })
  @HttpCode(HttpStatus.OK)
  async recoveryByEmail(
    @Body() body: EmailValidationBodyDTO,
    @Res() res: Response,
  ) {
    const result = await this.authService.recoveryByEmail(body);
    return res.status(200).send(result);
  }

  @Post('recovery/email/confirmation')
  @Public()
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
  @ApiResponse({
    status: 200,
    description: 'Returns status of setting new password (done/cancelled)',
  })
  @HttpCode(HttpStatus.OK)
  async recoveryByEmailConfirm(
    @Body() body: EmailValidationConfirmDTO,
    @Res() res: Response,
  ) {
    await this.authService.recoveryByEmailConfirm(body);
    return res.status(200);
  }
}
