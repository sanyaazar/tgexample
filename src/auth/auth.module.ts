import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Hasher } from './hasher';
import { TokenGenerator } from './tokenGenerator';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { AuthGuard } from './auth.guard';
import { AuthRepository, UserRepository } from 'src/database';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    Hasher,
    TokenGenerator,
    EmailService,
    AuthGuard,
    AuthRepository,
    UserRepository,
  ],
  controllers: [AuthController],
  exports: [JwtModule, AuthGuard, AuthRepository, UserRepository],
})
export class AuthModule {}
