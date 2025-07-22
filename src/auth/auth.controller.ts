/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      message: 'Login successful',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: req.user,
    };
  }
}
