import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Nội dung mới của bình luận',
    example: 'Updated comment content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
