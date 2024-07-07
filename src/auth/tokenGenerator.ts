import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRegisterResDTO } from 'src/types';

@Injectable()
export class TokenGenerator {
  constructor(private jwtService: JwtService) {}

  public async generateTokens(payload: {
    id: number;
    login: string;
  }): Promise<AuthRegisterResDTO> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Create an instance of AuthRegisterResDTO
    const authRegisterResDTO = new AuthRegisterResDTO();
    authRegisterResDTO.access_token = accessToken;
    authRegisterResDTO.refresh_token = refreshToken;

    return authRegisterResDTO;
  }
}
