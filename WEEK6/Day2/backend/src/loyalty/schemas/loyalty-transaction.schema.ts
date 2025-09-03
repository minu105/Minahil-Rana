import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoyaltyTransactionDocument = LoyaltyTransaction & Document;

export enum LoyaltyType {
  EARN = 'EARN',
  SPEND = 'SPEND',
  ADJUST = 'ADJUST',
}

@Schema({ timestamps: true })
export class LoyaltyTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: LoyaltyType, required: true })
  type: LoyaltyType;

  @Prop({ required: true })
  points: number; // positive for earn, negative for spend

  @Prop()
  reason?: string;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;
}

export const LoyaltyTransactionSchema = SchemaFactory.createForClass(LoyaltyTransaction);
LoyaltyTransactionSchema.index({ userId: 1, createdAt: -1 });
