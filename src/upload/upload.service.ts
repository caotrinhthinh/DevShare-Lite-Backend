import { UserService } from './../user/user.service';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private userService: UserService,
  ) {}

  async uploadUserAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    const resutl = await this.cloudinaryService.uploadImage(
      file,
      'avatar',
      userId,
    );
    await this.userService.updateAvatar(userId, resutl.secure_url);
    return resutl;
  }

  uploadPostImage(
    postId: string,
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return this.cloudinaryService.uploadImage(file, 'post', postId);
  }
}
