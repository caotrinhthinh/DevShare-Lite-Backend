import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostDocument, PostStatus } from './schemas/post.schema';
import { CreatePostDto, UpdatePostDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}
  create(
    authorId: string,
    createPostDto: CreatePostDto,
  ): Promise<PostDocument | null> {
    const post = new this.postModel({
      ...createPostDto,
      author: authorId,
    });
    return post.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: PostStatus,
  ): Promise<{ posts: Post[]; total: number }> {
    page = Math.max(1, page);
    limit = Math.max(1, limit);

    const skip = (page - 1) * limit;
    const filter = status ? { status } : { status: PostStatus.PUBLISHED };

    const posts = await this.postModel
      .find(filter)
      .populate('author', 'name email') // lấy thông tin người viết bài
      .sort({ createdAt: -1 })
      .skip(skip) // bỏ qua bài trước đó
      .limit(limit)
      .exec();

    const total = await this.postModel.countDocuments(filter);

    return { posts, total };
  }

  async findById(id: string): Promise<PostDocument | null> {
    const post = await this.postModel
      .findById(id)
      .populate('author', 'name email')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return post;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
