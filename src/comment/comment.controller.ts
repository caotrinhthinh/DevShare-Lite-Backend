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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Comments')
@Controller('posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // Đặt lên trên @Get() để tránh conflict route
  @ApiOperation({ summary: 'Get all replies of a comment' })
  @ApiResponse({ status: 200, description: 'List of nested replies' })
  @ApiParam({ name: 'postId' })
  @ApiParam({ name: 'commentId' })
  @Get(':commentId/replies')
  async getReplies(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commentService.findReplies(commentId);
  }

  @ApiOperation({ summary: 'Create a comment' })
  @ApiResponse({ status: 201, description: 'Comment created' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser('_id') userId: Types.ObjectId,
  ) {
    return this.commentService.create(postId, createCommentDto, userId);
  }

  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @Get()
  async findByPost(@Param('postId') postId: string) {
    return this.commentService.findByPost(postId);
  }

  @ApiOperation({ summary: 'Update a comment' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiParam({ name: 'postId', required: true })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Comment updated' })
  @Put(':commentId')
  async update(
    @Param('postId') postId: string,
    @Param('commentId') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser('_id') userId: Types.ObjectId,
  ) {
    return this.commentService.update(id, updateCommentDto, userId);
  }

  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted' })
  @ApiParam({ name: 'postId' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async delete(
    @Param('postId') postId: string,
    @Param('commentId') id: string,
    @GetUser('_id') userId: Types.ObjectId,
  ) {
    return this.commentService.delete(id, userId);
  }

  @ApiOperation({ summary: 'Like/unlike a comment' })
  @ApiResponse({ status: 200, description: 'Like toggled' })
  @ApiParam({ name: 'postId' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @UseGuards(JwtAuthGuard)
  @Post(':commentId/like')
  async likeComment(
    @Param('postId') postId: string,
    @Param('commentId') id: string,
    @GetUser('_id') userId: Types.ObjectId,
  ) {
    return this.commentService.likeComment(id, userId);
  }
}
