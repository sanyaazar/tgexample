import { ApiProperty } from '@nestjs/swagger';

export class GetUserDialogsDTO {
  @ApiProperty({
    description: "List of user's dialogs ID",
    example: ['21b3h12b', '1b2j3b12j'],
    type: 'list',
    required: true,
  })
  dialogsID: string[];
}
