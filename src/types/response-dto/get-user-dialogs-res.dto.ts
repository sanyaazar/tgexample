import { ApiProperty } from '@nestjs/swagger';

export class GetUserDialogsDTO {
  @ApiProperty({
    description: "List of user's dialogs ID",
    example: ['212131', '112312'],
    type: 'list',
    required: true,
  })
  usersWithDialog: number[];
}
