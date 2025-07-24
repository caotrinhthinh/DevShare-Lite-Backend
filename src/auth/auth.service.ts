import { RegisterDto } from './dto/register.dto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { SanitizedUser } from '../user/interface/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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
    // if (!isPasswordValid || !user.isEmailVerified) {
    //   return null;
    // }

    if (!isPasswordValid) {
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
    const emailVerificationToken = randomBytes(32).toString('hex');

    // Create user
    const user = await this.userService.create({
      email,
      password: hashedPassword,
      name,
      emailVerificationToken,
    });

    // Send verification email
    // await this.sendVerificationEmail(user.email, emailVerificationToken);

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
}
