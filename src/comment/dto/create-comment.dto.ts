import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Nội dung bình luận',
    example: 'This is a great post!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'ID của bình luận cha nếu đây là trả lời',
    example: 'ObjectId',
  })
  @IsMongoId()
  @IsOptional()
  parentComment?: string;
}
