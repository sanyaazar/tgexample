import { ApiBodyOptions, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class SendMessageBodyDTO {
  @ApiProperty({
    description: 'Text of the message',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  @IsString()
  @Length(1, 255)
  messageText: string;

  @IsOptional()
  @ApiProperty({ description: 'File in binary format', required: false })
  @IsString()
  file: string;
}
