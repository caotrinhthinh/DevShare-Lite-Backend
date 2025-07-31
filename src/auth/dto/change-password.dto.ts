import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'current_password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'new_password' })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword: string;
}
