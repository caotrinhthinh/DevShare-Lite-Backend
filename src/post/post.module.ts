import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { CustomCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    CustomCacheModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService, MongooseModule],
})
export class PostModule {}
