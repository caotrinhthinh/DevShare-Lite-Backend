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

  async delete(id: string, userId: Types.ObjectId): Promise<void> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Delete all replies
    await this.commentModel.deleteMany({ parentComment: id });

    // Remove from parent's replies if it's a reply
    if (comment.parentComment) {
      await this.commentModel.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: id },
      });
    }

    // Delete the comment
    await this.commentModel.findByIdAndDelete(id);

    // Update post comment count
    const replyCount = await this.commentModel.countDocuments({
      parentComment: id,
    });
    await this.postModel.findByIdAndUpdate(comment.post, {
      $inc: { commentCount: -(replyCount + 1) },
    });
  }

  async likeComment(
    id: string,
    userId: Types.ObjectId,
  ): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const userIdStr = userId.toString();
    const likedByStr = comment.likedBy.map((uid) => uid.toString());

    const hasLiked = likedByStr.includes(userIdStr);

    if (hasLiked) {
      comment.likeCount = Math.max(comment.likeCount - 1, 0);
      comment.likedBy = comment.likedBy.filter(
        (uid) => uid.toString() !== userIdStr,
      );
    } else {
      comment.likeCount += 1;
      comment.likedBy.push(userId);
    }

    await comment.save();

    return (await this.commentModel
      .findById(id)
      .populate('author', 'name email')
      .exec())!;
  }
}
