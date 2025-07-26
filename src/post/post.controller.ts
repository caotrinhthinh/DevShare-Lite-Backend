import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../common/passport/jwt-auth.guard';
import { GetUser } from '../common/decorators';
import { PostStatus } from './schemas/post.schema';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @GetUser('_id') authorId: string,
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

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.postService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
