import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { DialogModule } from './dialog/dialog.module';
import { ContentModule } from './content/content.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [AuthModule, ProfileModule, DialogModule, ContactsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
