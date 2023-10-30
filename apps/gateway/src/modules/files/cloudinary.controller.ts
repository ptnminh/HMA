import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
@ApiTags('Files')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile('file') file: Express.Multer.File) {
    try {
      return this.cloudinaryService.uploadFile(file);
    } catch (error) {
      console.log('@@@', error);
      throw new HttpException(
        {
          message: 'Internal server error',
          data: null,
          status: false,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
