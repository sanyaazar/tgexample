import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { AuthModule } from 'src/auth';
import { ContactRepository, UserRepository } from 'src/database';
import { ContactsModule } from 'src/contacts';

@Module({
  imports: [AuthModule],
  controllers: [ProfileController],
  providers: [ProfileService, UserRepository, ContactRepository],
  exports: [UserRepository, ContactRepository],
})
export class ProfileModule {}
