import { IsEmail } from 'class-validator';
export class ForgotPassworDto {
  @IsEmail()
  email: string;
}
