import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { ContactRepository, UserRepository } from 'src/database';
import { ProfileService } from 'src/profile';

@Module({
  controllers: [ContactsController],
  providers: [
    ContactsService,
    ContactRepository,
    UserRepository,
    ProfileService,
  ],
  exports: [ContactRepository, UserRepository],
})
export class ContactsModule {}
