import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true }) // thêm createdAt và updatedAt
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationCode: string;

  @Prop()
  passwordResetCode: string; // Lấy code xác thực được gửi qua mail

  @Prop()
  passwordResetToken: string; // Để xác thực sau khi nhập code vào để đổi mật khẩu

  @Prop()
  passwordResetExpires: Date;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
