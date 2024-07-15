import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AuthResDTO,
  GeneratedTokenDTO,
  GenerateTokenPayloadDTO,
  RefreshPayload,
} from 'src/types';
import { ONE_SECOND } from './constants';

@Injectable()
export class TokenGenerator {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates access and refresh tokens for the provided input.
   *
   * @param {GenerateTokenPayloadDTO} input - The input payload for generating the tokens.
   * @returns {Promise<GeneratedTokenDTO>} - A promise that resolves to a `GeneratedTokenDTO` object containing the generated access and refresh tokens, and the expiration time of the refresh token.
   */
  public async generateTokens(
    input: GenerateTokenPayloadDTO,
  ): Promise<GeneratedTokenDTO> {
    const accessToken = await this.jwtService.signAsync(input, {
      expiresIn: this.configService.get<string>('access_token_time'),
    });

    const refreshPayload = this.appendRefreshExpiration(input.id);
    const { exp, ...payloadWithoutExp } = refreshPayload;

    const refreshToken = await this.jwtService.signAsync(payloadWithoutExp, {
      expiresIn: refreshPayload.exp,
    });

    const authResDTO = new GeneratedTokenDTO();
    authResDTO.access_token = accessToken;
    authResDTO.refresh_token = refreshToken;
    authResDTO.exp = new Date(refreshPayload.exp * 1000); // Assuming that `exp` is a timestamp

    return authResDTO;
  }

  /**
   * Appends the expiration time for a refresh token based on the configured refresh token time.
   *
   * @param {number} id - The ID of the user for whom the refresh token is being generated.
   * @returns {RefreshPayload} - An object containing the user ID and the expiration time of the refresh token.
   */
  private appendRefreshExpiration(id: number): RefreshPayload {
    const refresh_token_time = +this.configService.get<number>(
      'REFRESH_TOKEN_TIME_SEC',
    )!;

    const exp = Math.floor(Date.now() / ONE_SECOND + refresh_token_time);

    return {
      id,
      exp,
    };
  }
}
