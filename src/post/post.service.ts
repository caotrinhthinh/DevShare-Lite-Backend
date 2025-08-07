import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post, PostDocument, PostStatus } from './schemas/post.schema';
import { CreatePostDto, UpdatePostDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly cacheService: CacheService,
  ) {}

  create(
    authorId: Types.ObjectId,
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
    const cacheKey = `post:${id}`;

    const cached = await this.cacheService.get<PostDocument>(cacheKey);
    if (cached) return cached;

    const post = await this.postModel
      .findById(id)
      .populate('author', 'name email')
      .lean()
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    // Cache lại kết quả
    await this.cacheService.set(cacheKey, post, 600); // TTL 600s

    return post;
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: Post[]; total: number }> {
    page = Math.max(1, page);
    limit = Math.max(1, limit);

    const skip = (page - 1) * limit;

    const searchFilter = {
      status: PostStatus.PUBLISHED,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    };

    const posts = await this.postModel
      .find(searchFilter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.postModel.countDocuments(searchFilter);
    return { posts, total };
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: Types.ObjectId,
  ): Promise<PostDocument | null> {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // console.log('>>' + post.author.toString());
    // console.log(userId);

    if (post.author.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only update your own posts');
    }

    await this.cacheService.del(`post:${id}`);

    return this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();
  }

  async delete(id: string, userId: Types.ObjectId): Promise<void> {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.cacheService.del(`post:${id}`);

    await this.postModel.findByIdAndDelete(id);
  }

  async findByAuthor(
    authorId: Types.ObjectId,
    includePrivate: boolean = false,
  ): Promise<Post[]> {
    const filter = includePrivate
      ? { author: authorId }
      : { author: authorId, status: PostStatus.PUBLISHED };

    return this.postModel
      .find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async addImages(postId: string, imageUrls: string[]): Promise<void> {
    await this.postModel.findByIdAndUpdate(postId, {
      $addToSet: { images: { $each: imageUrls } }, // addToSet để tránh trùng lặp link
    });
  }
}
