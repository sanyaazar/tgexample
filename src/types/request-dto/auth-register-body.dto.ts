import { ApiBodyOptions, ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsDate,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class AuthRegisterBodyDTO {
  @ApiProperty({
    description: 'Username',
    minLength: 2,
    maxLength: 50,
    example: 'johnDoe123',
  })
  @Length(2, 50)
  @IsAlphanumeric()
  login: string;

  @ApiProperty({
    description: 'Password',
    minLength: 8,
    example: 'StrongPassword123',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 0,
  })
  password: string;

  @ApiProperty({
    description: 'Email address',
    format: 'email',
    example: 'example@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number',
    required: false,
    example: '+79991234567',
  })
  @IsPhoneNumber()
  tel: string;

  @ApiProperty({
    description: 'Date of birth',
    required: false,
    example: '01.01.2003',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'Display name',
    required: false,
    maxLength: 50,
    example: 'John',
  })
  @IsOptional()
  @Length(2, 50)
  displayName?: string;

  @ApiProperty({
    description: 'Display photo',
    required: false,
    maxLength: 50,
    example: 'photo.png',
  })
  @IsOptional()
  @Length(2, 50)
  displayPhoto?: string;
}

export const authRegisterBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      displayPhoto: {
        type: 'string',
        format: 'binary',
      },

      login: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      email: {
        type: 'email',
      },
      tel: {
        type: 'telephone',
      },
      dateOfBirth: {
        type: 'date',
      },
      displayName: {
        type: 'string',
      },
    },
  },
};
