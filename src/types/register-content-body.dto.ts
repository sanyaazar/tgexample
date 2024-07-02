import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn } from 'class-validator';

class BodyDTO {
  @ApiProperty({
    description: 'Type of content - video, photo, GIF',
  })
  @IsIn(['video', 'photo', 'GIF'])
  contentType: 'video' | 'photo' | 'GIF';

  @ApiProperty({ description: 'Message ID', example: 'abc123' })
  @IsNotEmpty()
  messageID: string;
}

export class RegisterContentBodyDTO {
  @ApiProperty({ description: 'Body information', type: BodyDTO })
  @IsNotEmpty()
  body: BodyDTO;
}
