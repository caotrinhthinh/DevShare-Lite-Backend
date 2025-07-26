import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
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
      const parent = await this.commentModel.findById(parentComment);
      if (!parent || parent.post.toString() !== postId) {
        throw new NotFoundException('Parent comment not found');
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
}
