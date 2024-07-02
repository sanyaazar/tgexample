import { ApiProperty } from '@nestjs/swagger';

export class GetUserContactInfoResDTO {
  @ApiProperty({
    description: "User's login",
    example: 'ivanov',
    type: 'string',
    required: true,
  })
  login: string;

  @ApiProperty({
    description: "User's telephone",
    example: '+79991234567',
    type: 'string',
    required: true,
  })
  tel?: string;

  @ApiProperty({
    description: "User's email",
    example: 'ivanov@gmail.com',
    type: 'string',
    required: true,
  })
  email?: string;

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
