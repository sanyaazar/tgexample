import { ApiProperty } from '@nestjs/swagger';
import { GetUserContactInfoResDTO } from './get-user-contact-info-res.dto';

export class GetUserContactsResDTO {
  @ApiProperty({
    description: "User's contacts. Contains user's ids.",
    example: ['dd43231d12', '7yb1yd12d'],
    type: 'string',
    required: true,
  })
  contactsID: number[];
}
