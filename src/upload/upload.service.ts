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
  ): Promise<{ message: string; avatarUrl: string }> {
    const { secure_url: avatarUrl } = await this.cloudinaryService.uploadImage(
      file,
      'avatar',
      userId,
    );

    await this.userService.updateAvatar(userId, avatarUrl);

    return {
      message: 'Avatar updated successfully',
      avatarUrl,
    };
  }

  uploadPostImage(
    postId: string,
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return this.cloudinaryService.uploadImage(file, 'post', postId);
  }
}
