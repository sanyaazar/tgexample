import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@prisma/client';

export class GetUserDialogDTO {
  @ApiProperty({
    description: "List of dialog's messages",
    example: ['yd2312dad32', 'hd8f2u1'],
    type: 'list',
    required: true,
  })
  messages: Message[];
}
