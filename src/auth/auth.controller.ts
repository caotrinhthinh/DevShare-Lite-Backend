import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { SanitizedUser } from 'src/user/interface/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: { user: SanitizedUser }) {
    return this.authService.login(req.user); // req.user được inject từ Local.strategy.validate()
  }

  @Get('verify-email')
  async verifyEmail(@Query('code') code: string, @Res() res: Response) {
    try {
      await this.authService.verifyEmail(code);

      return res.send(`
        <html>
          <head><title>Verification Success</title></head>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>Email verified successfully 🎉</h1>
            <p>You can now log in to your account.</p>
          </body>
        </html>
      `);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return res.send(`
        <html>
          <head><title>Verification Failed</title></head>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px; color: red;">
            <h1>Verification failed ❌</h1>
            <p>Invalid or expired verification link.</p>
          </body>
        </html>
      `);
    }
  }
}
