import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyResetCodeDto {
  @ApiProperty({
    description: 'Email dùng để kiểm tra mã khôi phục',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mã khôi phục được gửi qua email',
    example: '123456',
  })
  @IsString()
  code: string;
}
