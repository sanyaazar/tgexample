import { ApiBodyOptions, ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, Length } from 'class-validator';

export class CreateChatBodyDTO {
  @ApiProperty({
    description: 'Chat members login',
    example: ['12', '52'],
  })
  @IsAlphanumeric(undefined, { each: true })
  @Length(1, 50)
  userLogins: string[];
}

export const chatCreateBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      displayPhoto: {
        type: 'string',
        format: 'binary',
      },
      memberLogins: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
};
