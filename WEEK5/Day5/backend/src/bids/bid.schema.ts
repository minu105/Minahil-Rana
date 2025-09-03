import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BidDocument = HydratedDocument<Bid>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Bid {
  @Prop({ type: Types.ObjectId, ref: 'Auction', required: true }) auction: any;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) bidder: any;
  @Prop({ required: true }) amount: number;
}

export const BidSchema = SchemaFactory.createForClass(Bid);
BidSchema.index({ auction: 1, createdAt: -1 });
