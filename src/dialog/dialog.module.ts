import { Module } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { DialogController } from './dialog.controller';
import {
  ContactRepository,
  DialogRepository,
  UserRepository,
} from 'src/database';
import { S3Repository } from 'src/database/s3.repository';
import { ContentRepository } from 'src/database/content.repository';

@Module({
  controllers: [DialogController],
  providers: [
    DialogService,
    DialogRepository,
    UserRepository,
    ContactRepository,
    S3Repository,
    ContentRepository,
  ],
  exports: [DialogRepository, UserRepository, S3Repository, ContentRepository],
})
export class DialogModule {}
