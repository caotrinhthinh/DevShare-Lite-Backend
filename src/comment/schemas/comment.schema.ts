import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentComment: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }], default: [] })
  replies: Types.ObjectId[];

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likedBy: Types.ObjectId[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Tìm comment theo bài post và comment cha
CommentSchema.index({ post: 1, parentComment: 1 });

// Tìm nhanh các comment có parentComment = null (comment gốc)
CommentSchema.index({ parentComment: 1 });

// Tìm theo author
CommentSchema.index({ author: 1 });

// Tìm theo bài post để lọc comment
CommentSchema.index({ post: 1 });

// Tìm theo thời gian tạo
CommentSchema.index({ createdAt: -1 });

// Tìm comment được like bởi user (trong likedBy)
CommentSchema.index({ likedBy: 1 });
