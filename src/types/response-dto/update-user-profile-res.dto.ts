import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserProfileResDTO {
  //   @ApiProperty({
  //     description: "User's login",
  //     example: 'ivanov',
  //     type: 'string',
  //     required: true,
  //   })
  //   login: string;

  @ApiProperty({
    description: "User's display name",
    example: 'Ivan Ivanov',
    type: 'string',
    required: false,
  })
  displayName?: string;

  @ApiProperty({
    description: "User's display photo",
    example: 'file.png',
    type: 'file',
    required: false,
  })
  displayPhoto?: string;

  @ApiProperty({
    description: "User's birthday date",
    example: '01.01.2003',
    type: 'date',
    required: false,
  })
  dateOfBirth?: Date;
}
