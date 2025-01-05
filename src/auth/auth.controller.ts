import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  AuthLoginLocalBodyDTO,
  authRegisterBody,
  AuthRegisterBodyDTO,
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
import { SessionService } from './session/session.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
@ApiExtraModels(AuthRegisterBodyDTO)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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
    description: 'Return userID of created user',
    content: {
      'application/json': {
        example: {
          userID: '12345',
        },
      },
    },
  })
  async createUser(@Body() body: AuthRegisterBodyDTO, @Res() res: Response) {
    const result = await this.authService.register(body);
    return res.json({ userID: result });
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
    description: 'Return an access token and a refresh token in cookies',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/AuthResDTO',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async localLogin(@Request() req, @Body() body: AuthLoginLocalBodyDTO) {
    const result = await this.authService.localLogin(
      body,
      req.ip,
      req.get('User-Agent'),
    );
    req.res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: false,
      path: '/auth',
    });

    return { access_token: result.access_token };
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
    return res.sendStatus(200);
  }

  @Delete('logout')
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Logout',
    description: 'The user logout from service',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns status of logout (done/cancelled)',
  })
  async logout(@Request() req, @Res() res: Response) {
    await this.sessionService.logout({
      userID: +req.user.id,
      refreshToken: req.cookies.refresh_token,
      userAgent: req.get('User-Agent'),
    });
    return res.sendStatus(200);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({
    tags: ['Authentication'],
    summary: 'Refresh tokens',
    description: 'The user refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Return an access token and a refresh token in cookies',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/AuthResDTO',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async updateRefreshTokens(@Request() req, @Res() res: Response) {
    const result = await this.sessionService.updateRefreshTokens({
      userID: await this.getUserIDFromRefreshToken(req.cookies.refresh_token),
      refreshToken: req.cookies.refresh_token,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.clearCookie('refresh_token');
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: false,
      path: '/auth',
    });
    return res.json({ access_token: result.access_token });
  }

  /**
   * Получает идентификатор пользователя из токена обновления.
   *
   * @function getUserIDFromRefreshToken
   * @param {any} token - Токен обновления.
   * @returns {Promise<number>} - Промис с идентификатором пользователя.
   * @throws {BadRequestException} - Если токен неверен или его не удается проверить.
   */
  private async getUserIDFromRefreshToken(token: any): Promise<number> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload.id;
    } catch {
      throw new BadRequestException();
    }
  }
}
