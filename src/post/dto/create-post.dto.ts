import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PostStatus } from '../schemas/post.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My first post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This is the content of the post.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: ['nestjs', 'typescript'], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ enum: PostStatus, default: PostStatus.DRAFT })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;
}
