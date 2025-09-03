import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  FULFILLED = 'FULFILLED',
}
export enum PaymentStatus {
  REQUIRES_PAYMENT = 'REQUIRES_PAYMENT',
  SUCCEEDED = 'SUCCEEDED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  titleSnapshot: string;

  @Prop({ required: true })
  qty: number;

  @Prop({ required: false })
  unitPriceMoney?: number;

  @Prop({ required: false })
  unitPricePoints?: number;
}
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  discountMoney: number;

  @Prop({ default: 0 })
  pointsSpent: number;

  @Prop({ default: 0 })
  pointsEarned: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PAID })
  status: OrderStatus;

  // Payment info (Stripe)
  @Prop()
  paymentIntentId?: string;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.REQUIRES_PAYMENT })
  paymentStatus: PaymentStatus;

  @Prop()
  paymentMethodBrand?: string; // e.g., visa, mastercard

  @Prop()
  paymentLast4?: string; // e.g., 4242
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ userId: 1, createdAt: -1 });
