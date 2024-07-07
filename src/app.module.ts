import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { DialogModule } from './dialog/dialog.module';
import { ContactsModule } from './contacts/contacts.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from './email/email.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делает ConfigModule глобальным, чтобы его не нужно было импортировать в каждом модуле
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    DialogModule,
    ContactsModule,
    ChatModule,
  ],
  controllers: [AppController, ChatController],
  providers: [
    AppService,
    EmailService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    ChatService,
  ],
})
export class AppModule {}
