import { IsEmail } from 'class-validator';
export class ForgotPassworDTO {
  @IsEmail()
  email: string;
}
