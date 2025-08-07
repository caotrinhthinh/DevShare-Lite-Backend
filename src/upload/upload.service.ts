import { PostService } from './../post/post.service';
import { UserService } from './../user/user.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private userService: UserService,
    private postService: PostService,
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

  async uploadPostImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.cloudinaryService.uploadImage(file, 'post'),
    );

    const results = await Promise.all(uploadPromises);

    return results.map((res) => res.secure_url);
  }
}
