import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { AuthModule } from 'src/auth';

@Module({
  imports: [AuthModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
