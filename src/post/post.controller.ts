import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../common/passport/jwt-auth.guard';
import { GetUser } from '../common/decorators';
import { PostStatus } from './schemas/post.schema';
import { Types } from 'mongoose';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @GetUser('_id') authorId: Types.ObjectId,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postService.create(authorId, createPostDto);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: PostStatus,
  ) {
    return this.postService.findAll(parseInt(page), parseInt(limit), status);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.postService.search(query, parseInt(page), parseInt(limit));
  }

  // Tìm bài post có id là id
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.postService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser('_id') userId: Types.ObjectId,
  ) {
    return this.postService.update(id, updatePostDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @GetUser('_id') userId: Types.ObjectId) {
    return this.postService.delete(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/my-posts')
  async getMyPosts(@GetUser('_id') userId: Types.ObjectId) {
    return this.postService.findByAuthor(userId, true);
  }
}
