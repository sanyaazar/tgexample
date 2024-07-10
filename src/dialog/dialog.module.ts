import { Module } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { DialogController } from './dialog.controller';
import {
  ContactRepository,
  DialogRepository,
  UserRepository,
} from 'src/database';

@Module({
  controllers: [DialogController],
  providers: [
    DialogService,
    DialogRepository,
    UserRepository,
    ContactRepository,
  ],
  exports: [DialogRepository, UserRepository],
})
export class DialogModule {}
