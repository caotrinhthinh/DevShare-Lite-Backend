import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDTO {
  @IsString()
  code: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
