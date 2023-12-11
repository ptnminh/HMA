import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('files')
@ApiTags('Files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('Bearer')
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
      const fileUploaded = await this.cloudinaryService.uploadFile(file);
      return {
        status: true,
        message: 'Upload file thành công',
        data: {
          originalname: fileUploaded.original_filename,
          url: fileUploaded.secure_url,
        },
      };
    } catch (error) {
      console.log('@@@', error);
      throw new HttpException(
        {
          message: error?.message || 'Upload file thất bại',
          data: null,
          status: false,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
