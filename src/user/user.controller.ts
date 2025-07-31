import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { GetUser } from '../common/decorators';
import { UserDocument } from './schemas/user.schemas';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Đổi mật khẩu
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request / wrong password' })
  async changePassword(
    @GetUser('_id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Return basic user profile',
    schema: {
      example: {
        email: 'user@example.com',
        name: 'John Doe',
        isEmailVerified: true,
        role: 'USER',
        createdAt: '2025-07-31T12:34:56.789Z',
      },
    },
  })
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
