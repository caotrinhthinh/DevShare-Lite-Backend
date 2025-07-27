import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { GetUser } from '../common/decorators';
import { UserDocument } from './schemas/user.schemas';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Đổi mật khẩu
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetUser('_id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: UserDocument) {
    return {
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
