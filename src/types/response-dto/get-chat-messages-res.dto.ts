import { ApiProperty } from '@nestjs/swagger';

export class GetChatMessagesResDTO {
  @ApiProperty({
    description: "List of chat's messages",
    example: ['2', '5'],
    type: 'list',
    required: true,
  })
  messagesID: string[];
}
