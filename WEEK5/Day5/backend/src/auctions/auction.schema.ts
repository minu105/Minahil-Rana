import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuctionDocument = HydratedDocument<Auction>;

@Schema({ timestamps: true })
export class Auction {
  @Prop({ type: Types.ObjectId, ref: 'Car', required: true }) car: any;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) seller: any;
  @Prop({ required: true }) startPrice: number;
  @Prop({ default: 100 }) minIncrement: number;
  @Prop({ required: true }) startAt: Date;
  @Prop({ required: true }) endAt: Date;
  @Prop({ default: 'scheduled' }) status: string; // 'scheduled'|'live'|'ended'|'completed'|'cancelled'
  @Prop({ type: Object }) topBid?: { amount: number, user: any, bidId: any };
  @Prop({ default: false }) notifiedEnded?: boolean;
}

export const AuctionSchema = SchemaFactory.createForClass(Auction);
AuctionSchema.index({ status: 1, endAt: 1 });
