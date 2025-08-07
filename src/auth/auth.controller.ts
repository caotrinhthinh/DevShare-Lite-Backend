import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { SanitizedUser } from '../user/interface/user.interface';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyResetCodeDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  login(
    @Request() req: { user: SanitizedUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(req.user, res); // req.user được inject từ Local.strategy.validate()
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user', description: 'Clear JWT cookie' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  // Xác thực email bằng mã code
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email with code' })
  @ApiQuery({
    name: 'code',
    description: 'Verification code sent to user email',
  })
  @ApiResponse({ status: 200, description: 'Returns verification HTML page' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Verification code not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async verifyEmail(@Query('code') code: string, @Res() res: Response) {
    const html = await this.authService.verifyEmail(code);
    return res.send(html);
  }

  // Gửi mã code qua email khi người dùng quên mật khẩu
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset code' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset code sent to email' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async forgotPassword(@Body() forgotPassword: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPassword);
  }

  // Xác thực code => trả resetToken
  @Post('verify-reset-code')
  @ApiOperation({ summary: 'Verify reset code and get reset token' })
  @ApiBody({ type: VerifyResetCodeDto })
  @ApiResponse({ status: 200, description: 'Reset token returned if valid' })
  async verifyResetCode(@Body() verifyResetCode: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyResetCode);
  }

  // Đặt lại mật khẩu mới
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Reset token not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
