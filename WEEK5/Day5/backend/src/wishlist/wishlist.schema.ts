import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true }) user: any;
  @Prop({ type: Types.ObjectId, ref: 'Car', index: true }) car: any;
}
export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
WishlistSchema.index({ user: 1, car: 1 }, { unique: true });
