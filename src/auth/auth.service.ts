import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { SanitizedUser } from '../user/interface/user.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import { readFileSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<SanitizedUser | null> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid || !user.isEmailVerified) {
      return null;
    }

    // Trả về user object (bỏ mật khẩu)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, password, ...result } = user.toObject();
    return {
      id: _id.toString(),
      ...result,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const emailVerificationCode = randomBytes(32).toString('hex');

    // Create user
    const user = await this.userService.create({
      email,
      password: hashedPassword,
      name,
      emailVerificationCode,
    });

    // Send verification email
    await this.sendVerificationEmail(
      user.email,
      user.name,
      emailVerificationCode,
    );

    return {
      message:
        'User registered successfully. Please check your email to verify your account.',
      user,
    };
  }

  login(user: SanitizedUser) {
    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async verifyEmail(code: string) {
    try {
      const user = await this.userService.findByEmailVerificationCode(code);
      if (!user) {
        throw new BadRequestException('Invalid verification token');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.userService.update(user.id, {
        isEmailVerified: true,
        emailVerificationCode: null,
      });

      return `
      <html>
        <head><title>Verification Success</title></head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h1>Email verified successfully 🎉</h1>
          <p>You can now log in to your account.</p>
        </body>
      </html>
    `;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return `
      <html>
        <head><title>Verification Failed</title></head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px; color: red;">
          <h1>Verification failed ❌</h1>
          <p>Invalid or expired verification link.</p>
        </body>
      </html>
    `;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      return {
        message:
          'If your email is registered, you will receive a password reset link',
      };
    }

    // Generate reset token
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // "6 chữ số"
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.userService.update(user.id, {
      passwordResetCode: code,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
    });

    // Send password reset email
    await this.sendPasswordResetEmail(user.email, user.name, code);

    return {
      message:
        'If your email is registered, you will receive a password reset link',
    };
  }

  async verifyResetCode(verifyResetCode: VerifyResetCodeDto) {
    const { code } = verifyResetCode;
    const user = await this.userService.findByPasswordResetCode(code);
    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired code');
    }

    const token = uuid();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.userService.update(user.id, {
      passwordResetToken: token,
      passwordResetCode: null,
      passwordResetExpires: null,
    });

    return { message: 'Code verified', token };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userService.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.userService.update(user.id, {
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: 'Password has been reset successfully' };
  }

  // Send verification email
  private async sendVerificationEmail(
    email: string,
    name: string,
    code: string,
  ) {
    const verificationUrl = `http://localhost:3000/api/auth/verify-email?code=${code}`;

    const templatePath = join(
      __dirname,
      '..',
      '..',
      'templates',
      'verify-email.html',
    );

    const htmlTemplate = readFileSync(templatePath, 'utf8');

    const content = htmlTemplate
      .replace('{{name}}', name)
      .replace('{{activationCode}}', verificationUrl);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Your Email - DevShare Lite',
      html: content,
    });
  }

  private async sendPasswordResetEmail(
    email: string,
    name: string,
    code: string,
  ) {
    const templatePath = join(
      __dirname,
      '..',
      '..',
      'templates',
      'reset-password.html',
    );

    const htmlTemplate = readFileSync(templatePath, 'utf8');

    const content = htmlTemplate
      .replace('{{name}}', name)
      .replace('{{code}}', code);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password - DevShare Lite',
      html: content,
    });
  }
}
