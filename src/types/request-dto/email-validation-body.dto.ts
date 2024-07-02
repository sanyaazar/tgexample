import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EmailValidationBodyDTO {
  @ApiProperty({
    description: 'Email address',
    format: 'email',
    example: 'example@gmail.com',
  })
  @IsEmail()
  email: string;
}
