import { CloudinaryModule } from './cloudinary/cloudinary.moudle';
import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [ConfigModule, CloudinaryModule, UserModule, PostModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
