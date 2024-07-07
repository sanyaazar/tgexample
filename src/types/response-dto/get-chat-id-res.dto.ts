import { ApiProperty } from '@nestjs/swagger';

export class GetChatIDResDTO {
  @ApiProperty({
    description: 'ChatID',
    example: '212131',
    type: 'string',
    required: true,
  })
  chatID: string;
}
