import { ApiProperty } from '@nestjs/swagger';

export class addUserToChatBodyDTO {
  @ApiProperty({
    description: 'UserLogin',
    example: '1',
  })
  userLogin: string;
}
