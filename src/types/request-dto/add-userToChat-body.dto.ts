import { ApiProduces, ApiProperty } from '@nestjs/swagger';

export class addUserToChatBodyDTO {
  @ApiProperty({
    description: 'UserID',
    example: '1',
  })
  userLogin: string;
}
