import { ApiProperty } from '@nestjs/swagger';

export class GetUserContactsResDTO {
  @ApiProperty({
    description: "User's contacts. Contains user's ids.",
    example: ['dd43231d12', '7yb1yd12d'],
    type: 'string',
    required: true,
  })
  contactsID: string[];
}
