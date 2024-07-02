import { ApiProperty } from '@nestjs/swagger';

export class GetUserDialogDTO {
  @ApiProperty({
    description: "List of dialog's messages",
    example: ['yd2312dad32', 'hd8f2u1'],
    type: 'list',
    required: true,
  })
  messagesID: string[];
}
