import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar/:userId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.uploadService.uploadUserAvatar(userId, file);
  }

  @Post('post/:postId')
  @UseInterceptors(FilesInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  uploadPostImage(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0)
      throw new BadRequestException('No file uploaded');
    return this.uploadService.uploadPostImages(files);
  }
}
