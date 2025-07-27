import { UpdateCommentDto } from './dto/update-comment.dto';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentDocument, Comment } from './schemas/comment.schema';
import { Post, PostDocument } from '../post/schemas/post.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}
  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    authorId: Types.ObjectId,
  ) {
    const { content, parentComment } = createCommentDto;

    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If it's a reply, verify parent comment exists
    if (parentComment) {
      const parent = await this.commentModel.findById(parentComment).lean();

      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parent.post.toString() !== postId.toString()) {
        throw new BadRequestException(
          'Parent comment does not belong to the same post',
        );
      }
    }

    // Create comment
    const comment = new this.commentModel({
      content,
      author: authorId,
      post: postId,
      parentComment: parentComment || null,
    });

    const savedComment = await comment.save();

    // Update parent comment replies if it's a reply
    if (parentComment) {
      await this.commentModel.findByIdAndUpdate(parentComment, {
        $addToSet: { replies: savedComment._id },
      });
    }

    // Update post comment count
    await this.postModel.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });

    return this.commentModel
      .findById(savedComment._id)
      .populate('author', 'name email')
      .exec();
  }

  async findByPost(postId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ post: postId, parentComment: null })
      .populate('author', 'name email')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: Types.ObjectId,
  ): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const updated = await this.commentModel
      .findByIdAndUpdate(id, updateCommentDto, {
        new: true,
      })
      .populate('author', 'name email')
      .exec();

    if (!updated) {
      throw new NotFoundException('Comment not found after update');
    }

    return updated;
  }

  async delete(id: string, userdId: string): Promise<void> {}
}
