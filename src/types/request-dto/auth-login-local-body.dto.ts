import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class AuthLoginLocalBodyDTO {
  @ApiProperty({
    description: 'Username',
    maxLength: 50,
    example: 'johnDoe123',
  })
  @Length(0, 50)
  @IsAlphanumeric()
  login: string;

  @ApiProperty({
    description: 'Password',
    example: 'StrongPassword123',
  })
  @IsString()
  password: string;
}
