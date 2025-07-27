import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { GetUser } from 'src/common/decorators';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/common/passport/jwt-auth.guard';

@Controller('posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser('_id') userId: Types.ObjectId,
  ) {
    return this.commentService.create(postId, createCommentDto, userId);
  }

  // Tìm các comment của bài post đó
  @Get()
  async findByPost(@Param('postId') postId: string) {
    return this.commentService.findByPost(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string, //commentId
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser('_id') userId: Types.ObjectId,
  ) {
    return this.commentService.update(id, updateCommentDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GetUser('_id') userId: Types.ObjectId,
  ) {
    return this.commentService.delete(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likeComment(
    @Param('id') id: string,
    @GetUser('_id') userId: Types.ObjectId,
  ) {
    return this.commentService.likeComment(id, userId);
  }
}
