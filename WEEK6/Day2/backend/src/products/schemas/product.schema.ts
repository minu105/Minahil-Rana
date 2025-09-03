import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';

export type ProductDocument = Product & Document;

export enum PurchaseType {
  MONEY = 'MONEY',
  POINTS = 'POINTS',
  HYBRID = 'HYBRID',
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true, min: 0 })
  basePrice: number; // in cents

  @Prop({ type: String, enum: PurchaseType, default: PurchaseType.MONEY })
  purchaseType: PurchaseType;

  @Prop({ min: 0 })
  pricePoints?: number; // required for POINTS or HYBRID

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
  categories: (Types.ObjectId | Category)[];

  @Prop({ default: false })
  onSale: boolean;

  @Prop({ min: 0 })
  salePrice?: number; // override price when onSale=true

  @Prop({ min: 0, max: 100 })
  discountPercent?: number; // admin-set discount

  @Prop()
  saleStartAt?: Date; // optional schedule start

  @Prop()
  saleEndAt?: Date; // optional schedule end (auto disable)

  // Notification flags to avoid duplicate realtime events
  @Prop({ default: false })
  saleNotifiedStart: boolean;

  @Prop({ default: false })
  saleNotifiedTenMin: boolean;

  @Prop({ default: false })
  saleNotifiedEnd: boolean;

  @Prop({ default: 0 })
  ratingAvg: number;

  @Prop({ default: 0 })
  ratingCount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ onSale: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ saleEndAt: 1 });
ProductSchema.index({ saleStartAt: 1 });
