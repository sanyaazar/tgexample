import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { RegisterContentBodyDTO } from 'src/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @ApiOperation({
    tags: ['Content'],
    summary: 'Creates a new content',
    description: 'Creates a new content (video, photo, GIF) linked a message ',
    requestBody: {
      description: 'Data to create a content',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/RegisterContentBodyDTO',
          },
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 200, description: 'Returns the uploaded content.' })
  async registerContent(
    @Body() body: RegisterContentBodyDTO,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    console.log(file);
    return res.status(200).send(body.body);
  }
}
