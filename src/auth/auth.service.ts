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
    const user = await this.userService.findByEmailVerificationToken(code);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.userService.update(user.id, {
      isEmailVerified: true,
      emailVerificationCode: null,
    });

    return { message: 'Email verified successfully' };
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
}
