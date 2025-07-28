import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { hashPasswordHelper } from '../helpers/util';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async create(userData: any): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmailVerificationCode(
    code: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ emailVerificationCode: code }).exec();
  }

  async findByPasswordResetCode(code: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        passwordResetCode: code,
        passwordResetExpires: { $gt: new Date() },
      })
      .exec();
  }

  async findByPasswordResetToken(token: string) {
    return this.userModel.findOne({ passwordResetToken: token }).explain(); // có trả về "IXSCAN" => đang dùng index
  }

  async update(id: string, updateData: any): Promise<UserDocument | null> {
    return (
      this.userModel
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec()
    );
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;
    const user = await this.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      throw new BadRequestException('Current password is incorrect');

    const hashed = await hashPasswordHelper(newPassword);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.update(user.id, { password: hashed });

    return { message: 'Password changed successfully' };
  }

  async getProfile(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .select(
        '-password -emailVerificationCode -passwordResetCode -passwordResetExpires',
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
