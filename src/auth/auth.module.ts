import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './passport/local.strategy';

@Module({
  imports: [UserModule, PassportModule],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
