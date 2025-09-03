import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument, LinePaymentChoice } from './schemas/cart.schema';
import { Product, ProductDocument, PurchaseType } from '../products/schemas/product.schema';
import { computeUnitMoneyPrice } from '../common/pricing.util';
import { UsersService } from '../users/users.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private usersService: UsersService,
  ) {}

  private resolveChoice(purchaseType: PurchaseType, chosen?: LinePaymentChoice): LinePaymentChoice {
    if (purchaseType === PurchaseType.MONEY) return LinePaymentChoice.MONEY;
    if (purchaseType === PurchaseType.POINTS) return LinePaymentChoice.POINTS;
    // HYBRID
    if (chosen !== LinePaymentChoice.MONEY && chosen !== LinePaymentChoice.POINTS) {
      throw new BadRequestException('chosenPayment is required for HYBRID products');
    }
    return chosen;
  }

  async getOrCreate(userId: string) {
    // Use atomic upsert to avoid race conditions that create duplicate carts
    const uid = new Types.ObjectId(userId);
    try {
      const cart = await this.cartModel
        .findOneAndUpdate(
          { userId: uid },
          { $setOnInsert: { userId: uid, items: [] } },
          { new: true, upsert: true }
        )
        .exec();
      // Attempt migration: if a legacy cart exists with string userId, merge items
      const legacy = await this.cartModel.findOne({ userId: userId as any }).exec();
      if (legacy && legacy.id !== cart.id && Array.isArray(legacy.items) && legacy.items.length > 0) {
        // merge items (accumulate quantities for same productId)
        const map = new Map<string, { qty: number; chosenPayment: LinePaymentChoice }>();
        for (const it of [...cart.items as any[], ...legacy.items as any[]]) {
          const key = String((it as any).productId);
          const prev = map.get(key);
          map.set(key, { qty: (prev?.qty || 0) + (it as any).qty, chosenPayment: (it as any).chosenPayment });
        }
        (cart as any).items = Array.from(map.entries()).map(([pid, v]) => ({ productId: new Types.ObjectId(pid), qty: v.qty, chosenPayment: v.chosenPayment }));
        await cart.save();
        await this.cartModel.deleteOne({ _id: legacy._id }).exec();
      }
      return cart as any;
    } catch (err: any) {
      // Handle possible E11000 from concurrent upserts by re-reading
      if (err?.code === 11000) {
        const existing = await this.cartModel.findOne({ userId: uid }).exec();
        if (existing) return existing;
      }
      throw err;
    }
  }

  async getComputed(userId: string) {
    const cart = await this.getOrCreate(userId);
    const productIds = cart.items.map((i) => i.productId);
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .lean()
      .exec();

    const map = new Map<string, Product>(products.map((p: any) => [String(p._id), p]));

    let moneySubtotal = 0;
    let pointsSubtotal = 0;

    const lines = cart.items.map((it) => {
      const p = map.get(String(it.productId));
      if (!p) return null;

      let unitMoney = 0;
      let unitPoints = 0;

      if (p.purchaseType === PurchaseType.MONEY) {
        unitMoney = computeUnitMoneyPrice(p as any);
      } else if (p.purchaseType === PurchaseType.POINTS) {
        unitPoints = p.pricePoints || 0;
      } else {
        if (it.chosenPayment === LinePaymentChoice.POINTS) unitPoints = p.pricePoints || 0;
        else unitMoney = computeUnitMoneyPrice(p as any);
      }

      const money = unitMoney * it.qty;
      const points = unitPoints * it.qty;
      moneySubtotal += money;
      pointsSubtotal += points;

      return {
        productId: String(it.productId),
        title: (p as any).title,
        qty: it.qty,
        chosenPayment: it.chosenPayment,
        unitMoney,
        unitPoints,
        lineMoney: money,
        linePoints: points,
        stock: (p as any).stock,
      };
    }).filter(Boolean) as any[];

    const user = await this.usersService.findById(userId);
    const firstPurchaseDiscount = user?.firstPurchaseEligible ? Math.round(moneySubtotal * 0.2) : 0;
    const totalMoney = moneySubtotal - firstPurchaseDiscount;

    return {
      items: lines,
      moneySubtotal,
      pointsSubtotal,
      firstPurchaseDiscount,
      totalMoney,
    };
  }

  async addItem(userId: string, productId: string, qty = 1, chosenPayment?: LinePaymentChoice) {
    const cart = await this.getOrCreate(userId);
    const product = await this.productModel.findById(productId).lean().exec();
    if (!product) throw new NotFoundException('Product not found');
    const enforced = this.resolveChoice(product.purchaseType as any, chosenPayment);

    const idx = cart.items.findIndex((i) => String(i.productId) === productId);
    if (idx >= 0) {
      cart.items[idx].qty += qty;
      cart.items[idx].chosenPayment = enforced as any;
    } else {
      cart.items.push({ productId: new Types.ObjectId(productId), qty, chosenPayment: enforced } as any);
    }
    await cart.save();
    return this.getComputed(userId);
  }

  async updateItem(userId: string, productId: string, qty: number, chosenPayment?: LinePaymentChoice) {
    const cart = await this.getOrCreate(userId);
    const idx = cart.items.findIndex((i) => String(i.productId) === productId);
    if (idx < 0) throw new NotFoundException('Item not in cart');
    const product = await this.productModel.findById(productId).lean().exec();
    if (!product) throw new NotFoundException('Product not found');
    const enforced = this.resolveChoice(product.purchaseType as any, chosenPayment ?? cart.items[idx].chosenPayment);
    cart.items[idx].qty = qty;
    cart.items[idx].chosenPayment = enforced as any;
    await cart.save();
    return this.getComputed(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getOrCreate(userId);
    cart.items = cart.items.filter((i) => String(i.productId) !== productId) as any;
    await cart.save();
    return this.getComputed(userId);
  }

  async clear(userId: string) {
    const cart = await this.getOrCreate(userId);
    cart.items = [] as any;
    await cart.save();
    return this.getComputed(userId);
  }
}
