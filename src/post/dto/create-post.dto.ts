import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';
import { PostStatus } from '../schemas/post.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    example: 'string',
    description: 'Title of the post',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  title: string;

  @ApiProperty({
    example: 'string',
    description: 'Main content of the post',
  })
  @IsString()
  @IsNotEmpty({ message: 'Content must not be empty' })
  content: string;

  @ApiProperty({
    example: ['nestjs', 'typescript'],
    required: false,
    description: 'Optional tags for the post (must be unique)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Tags array must not be empty if provided' })
  @ArrayUnique({ message: 'Tags must be unique' })
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    enum: PostStatus,
    default: PostStatus.DRAFT,
    required: false,
    description: 'Post status: DRAFT or PUBLISHED',
  })
  @IsOptional()
  @IsEnum(PostStatus, {
    message: `Status must be one of: ${Object.values(PostStatus).join(', ')}`,
  })
  status?: PostStatus;
}
