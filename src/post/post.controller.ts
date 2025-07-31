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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators';
import { PostStatus } from './schemas/post.schema';
import { Types } from 'mongoose';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Posts')
@ApiBearerAuth() // Yêu cầu Bearer token nếu dùng JwtAuthGuard
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(
    @GetUser('_id') authorId: Types.ObjectId,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postService.create(authorId, createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PostStatus,
  })
  @ApiResponse({ status: 200, description: 'List of posts' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: PostStatus,
  ) {
    return this.postService.findAll(parseInt(page), parseInt(limit), status);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search posts by title, content, or tags' })
  async search(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.postService.search(query, parseInt(page), parseInt(limit));
  }

  // Tìm bài post có id là id
  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post found' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiOperation({ summary: 'Get a single post by ID' })
  async findById(@Param('id') id: string) {
    return this.postService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a post (only by the author)' })
  @ApiParam({ name: 'id', required: true, description: 'Post ID' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not the author' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser('_id') userId: Types.ObjectId,
  ) {
    return this.postService.update(id, updatePostDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post (only by the author)' })
  @ApiParam({ name: 'id', required: true, description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not the author' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  delete(@Param('id') id: string, @GetUser('_id') userId: Types.ObjectId) {
    return this.postService.delete(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiOperation({ summary: 'Get posts of current logged-in user' })
  @ApiResponse({ status: 200, description: "User's posts retrieved" })
  async getMyPosts(@GetUser('_id') userId: Types.ObjectId) {
    return this.postService.findByAuthor(userId, true);
  }
}
