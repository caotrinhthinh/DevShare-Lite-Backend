import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token được trả về sau khi xác thực mã reset',
    example: 'string',
  })
  @IsString()
  resetToken: string;

  @ApiProperty({
    description: 'Mật khẩu mới (tối thiểu 6 ký tự)',
    example: 'string',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
