import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email người dùng dùng để nhận mã khôi phục mật khẩu',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
