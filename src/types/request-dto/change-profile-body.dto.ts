import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsDate,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class ChangeProfileBodyDTO {
  // @ApiProperty({
  //   description: 'Login',
  //   minLength: 2,
  //   maxLength: 50,
  //   example: 'ivanov',
  // })
  // @Length(2, 50)
  // @IsAlphanumeric()
  // login: string;

  @ApiProperty({
    description: 'Phone number',
    required: false,
    example: '+79991234567',
  })
  @IsOptional()
  @IsPhoneNumber()
  tel?: string;

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
    example: 'Ivan Ivanov',
  })
  @IsOptional()
  @Length(2, 50)
  displayName?: string;
}
