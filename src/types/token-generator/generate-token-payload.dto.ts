import { ApiProperty } from '@nestjs/swagger';

export class GenerateTokenPayloadDTO {
  @ApiProperty({
    description: 'User ID',
    example: '1',
  })
  id: number;
}
