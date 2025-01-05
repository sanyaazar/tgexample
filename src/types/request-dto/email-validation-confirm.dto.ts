import { ApiProperty } from '@nestjs/swagger';
import {
  IsBase64,
  IsEmail,
  IsString,
  IsStrongPassword,
  IsUrl,
  Length,
} from 'class-validator';

export class EmailValidationConfirmDTO {
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
    description: 'Received code from Email',
    example: 'TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdC',
  })
  // @IsBase64()
  @IsString()
  @Length(5, 100)
  code: string;
}
