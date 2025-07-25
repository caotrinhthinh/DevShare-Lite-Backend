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
import { LocalAuthGuard } from '../common/passport/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { SanitizedUser } from '../user/interface/user.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from '../common/passport/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUser } from '../common/decorators';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';

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
    const html = await this.authService.verifyEmail(code);
    return res.send(html);
  }

  // Gửi mã code qua email khi người dùng quên mật khẩu
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPassword: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPassword);
  }

  // Xác thực code => trả resetToken
  @Post('verify-reset-code')
  async verifyResetCode(@Body() verifyResetCode: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyResetCode);
  }

  // Đặt lại mật khẩu mới
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Đổi mật khẩu
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetUser('_id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
