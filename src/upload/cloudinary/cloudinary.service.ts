/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/upload/cloudinary/cloudinary.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { getUploadFolder } from './cloudinary.utils';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private cloudinaryInstance: typeof cloudinary,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    type: 'avatar' | 'post',
    id: string, // userId or postId
  ): Promise<UploadApiResponse> {
    const folder = getUploadFolder(type, id);

    return new Promise((resolve, reject) => {
      const stream = this.cloudinaryInstance.uploader.upload_stream(
        { folder },
        (error, result) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed: No result'));
          resolve(result);
        },
      );

      Readable.from(file.buffer as Buffer).pipe(stream);
    });
  }
}
