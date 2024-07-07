import { ApiBodyOptions, ApiProperty } from '@nestjs/swagger';

export class CreateChatBodyDTO {
  @ApiProperty({
    description: 'Chat members login',
    example: ['12', '52'],
  })
  memberLogins: string[];
}

export const chatCreateBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      displayPhoto: {
        type: 'string',
        format: 'binary',
      },
      membersID: {
        type: 'array',
        items: {
          type: 'number',
        },
      },
    },
  },
};
