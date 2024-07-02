import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsStrongPassword, Length } from 'class-validator';

export class AuthLoginLocalBodyDTO {
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
}
