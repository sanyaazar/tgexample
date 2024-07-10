import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@prisma/client';

export class GetChatMessagesResDTO {
  @ApiProperty({
    description: "List of chat's messages",
    example: ['2', '5'],
    type: 'list',
    required: true,
  })
  messages: Message[];
}
