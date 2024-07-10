import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRegisterResDTO } from 'src/types';

@Injectable()
export class TokenGenerator {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async generateTokens(payload: {
    id: number;
  }): Promise<AuthRegisterResDTO> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('access_token_time'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('refresh_token_time'),
    });

    // Create an instance of AuthRegisterResDTO
    const authRegisterResDTO = new AuthRegisterResDTO();
    authRegisterResDTO.access_token = accessToken;
    authRegisterResDTO.refresh_token = refreshToken;

    return authRegisterResDTO;
  }
}
