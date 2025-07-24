import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

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

  async findByEmailVerificationToken(
    code: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ emailVerificationCode: code }).exec();
  }

  async update(id: string, updateData: any): Promise<UserDocument | null> {
    return (
      this.userModel
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec()
    );
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
