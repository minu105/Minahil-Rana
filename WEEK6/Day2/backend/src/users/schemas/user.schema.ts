import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({ default: 0 })
  loyaltyPoints: number;

  @Prop({ default: true })
  firstPurchaseEligible: boolean;

  // Email verification
  @Prop({ default: false })
  isEmailVerified: boolean;

  // OTP storage (hashed) and expiry
  @Prop()
  otpHash?: string;

  @Prop()
  otpExpiresAt?: Date;

  // For resend throttling
  @Prop()
  otpLastSentAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
