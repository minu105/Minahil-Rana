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

  // Backward-compatible stock for single-SKU products
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

  // ----- Variants & derived fields for filtering -----
  @Prop({
    type: [
      {
        sku: { type: String, required: true },
        color: { type: String },
        colorCode: { type: String },
        size: { type: String },
        price: { type: Number, min: 0 },
        stock: { type: Number, min: 0, default: 0 },
        images: { type: [String], default: [] },
        attrs: { type: Object, default: {} },
      },
    ],
    default: [],
  })
  variants: Array<{
    sku: string;
    color?: string;
    colorCode?: string;
    size?: string;
    price?: number;
    stock: number;
    images?: string[];
    attrs?: Record<string, string>;
  }>;

  @Prop({ type: [String], default: [] })
  styles: string[]; // e.g., Casual, Formal, Party, Gym

  @Prop({ type: Object, default: {} })
  attributes?: Record<string, string[]>; // generic facets

  @Prop({ default: false })
  hasVariants: boolean;

  // Derived fields (filled automatically)
  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop({ type: [String], default: [] })
  sizes: string[];

  @Prop({ min: 0 })
  minPrice?: number;

  @Prop({ min: 0 })
  maxPrice?: number;

  @Prop({ default: 0, min: 0 })
  totalStock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ onSale: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ saleEndAt: 1 });
ProductSchema.index({ saleStartAt: 1 });
ProductSchema.index({ 'variants.color': 1, 'variants.size': 1 });
ProductSchema.index({ minPrice: 1 });
ProductSchema.index({ maxPrice: 1 });

// Helpers to compute derived fields
function computePricePoints(doc: any) {
  const moneyPerPoint = Number(process.env.LOYALTY_MONEY_PER_POINT) || 100;
  if (doc.purchaseType === PurchaseType.POINTS || doc.purchaseType === PurchaseType.HYBRID) {
    const base = Number(doc.basePrice || 0);
    doc.pricePoints = Math.floor(base / moneyPerPoint);
  } else {
    // Not applicable for pure money products
    doc.pricePoints = undefined;
  }
}

function computeDerived(doc: any) {
  const variants = Array.isArray(doc.variants) ? doc.variants : [];
  doc.hasVariants = variants.length > 0;

  if (doc.hasVariants) {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    let minPrice = Number.POSITIVE_INFINITY;
    let maxPrice = 0;
    let totalStock = 0;

    for (const v of variants) {
      if (v.color) colors.add(v.color);
      if (v.size) sizes.add(v.size);
      const p = typeof v.price === 'number' ? v.price : doc.basePrice || 0;
      if (p < minPrice) minPrice = p;
      if (p > maxPrice) maxPrice = p;
      totalStock += Math.max(0, Number(v.stock || 0));
    }

    doc.colors = Array.from(colors);
    doc.sizes = Array.from(sizes);
    doc.minPrice = isFinite(minPrice) ? minPrice : doc.basePrice || 0;
    doc.maxPrice = maxPrice || doc.basePrice || 0;
    doc.totalStock = totalStock;
  } else {
    // Single SKU fallback
    doc.colors = [];
    doc.sizes = [];
    doc.minPrice = doc.basePrice || 0;
    doc.maxPrice = doc.basePrice || 0;
    doc.totalStock = Math.max(0, Number(doc.stock || 0));
  }
}

ProductSchema.pre('save', function (next) {
  // @ts-ignore
  computePricePoints(this);
  // @ts-ignore
  computeDerived(this);
  next();
});

ProductSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate() || {};
  // If variants/basePrice/stock are being modified, recompute derived fields
  const shouldRecompute =
    update.$set?.variants || update.variants ||
    update.$set?.basePrice || update.basePrice ||
    update.$set?.stock || update.stock;

  if (shouldRecompute) {
    const $set = update.$set || (update.$set = {});
    // We cannot access the final doc here; approximate using update values
    // Rely on MongoDB to set and then trigger a second update via pipeline is overkill
    // Instead, we mark a flag and recompute in a post hook
    (this as any)._needsDerived = true;
  }
  next();
});

ProductSchema.post('findOneAndUpdate', async function (res: any) {
  // Recompute after update when needed
  // @ts-ignore
  if (res) {
    computePricePoints(res);
    computeDerived(res);
    await res.updateOne({
      $set: {
        pricePoints: res.pricePoints,
        hasVariants: res.hasVariants,
        colors: res.colors,
        sizes: res.sizes,
        minPrice: res.minPrice,
        maxPrice: res.maxPrice,
        totalStock: res.totalStock,
      },
    }).exec();
  }
});
