import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) email: string;
  @Prop({ required: true, select: false }) password: string;
  @Prop({ default: '' }) bio: string;
  @Prop({ default: '' }) avatarUrl: string;
  @Prop({ default: 0 }) followersCount: number;
  @Prop({ default: 0 }) followingCount: number;
}
export const UserSchema = SchemaFactory.createForClass(User);
