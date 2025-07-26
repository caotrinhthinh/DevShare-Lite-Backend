import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto';
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
}
