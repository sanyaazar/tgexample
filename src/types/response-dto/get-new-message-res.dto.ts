import { ApiProperty } from '@nestjs/swagger';

export class GetNewMessageResID {
  @ApiProperty({
    description: 'MessageID',
    example: '321jn312n',
    type: 'string',
    required: true,
  })
  messageID: string;
}
