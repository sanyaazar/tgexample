import { ApiBodyOptions, ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class SendMessageBodyDTO {
  @ApiProperty({
    description: 'Text of the message',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  messageText: string;

  // @ApiProperty({ description: 'File in binary format', required: false })
  // file: string;
}

export const csvBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },

      message: {
        type: 'string',
      },
    },
  },
};
