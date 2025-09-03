import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from './schemas/order.schema';
import { Cart, CartDocument, LinePaymentChoice } from '../cart/schemas/cart.schema';
import { Product, ProductDocument, PurchaseType } from '../products/schemas/product.schema';
import { computeUnitMoneyPrice } from '../common/pricing.util';
import { UsersService } from '../users/users.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private usersService: UsersService,
    private loyalty: LoyaltyService,
    private notifications: NotificationsGateway,
  ) {}

  async computeCartTotals(userId: string) {
    const uid = new Types.ObjectId(userId);
    const cart = await this.cartModel.findOne({ userId: uid }).exec();
    if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');

    const productIds = cart.items.map((i) => i.productId);
    const products = await this.productModel.find({ _id: { $in: productIds } }).exec();
    const map = new Map<string, ProductDocument>(products.map((p) => [String(p._id), p]));

    let moneySubtotal = 0;
    let pointsSpent = 0;
    const items: any[] = [];

    for (const it of cart.items) {
      const p = map.get(String(it.productId));
      if (!p) throw new BadRequestException('Product missing');
      if (p.stock < it.qty) throw new BadRequestException(`Insufficient stock for ${p.title}`);

      if (p.purchaseType === PurchaseType.POINTS || (p.purchaseType === PurchaseType.HYBRID && it.chosenPayment === LinePaymentChoice.POINTS)) {
        const unitPoints = p.pricePoints || 0;
        pointsSpent += unitPoints * it.qty;
        items.push({ productId: p._id, titleSnapshot: p.title, qty: it.qty, unitPricePoints: unitPoints });
      } else {
        const unitMoney = computeUnitMoneyPrice(p);
        moneySubtotal += unitMoney * it.qty;
        items.push({ productId: p._id, titleSnapshot: p.title, qty: it.qty, unitPriceMoney: unitMoney });
      }
    }

    const user = await this.usersService.findById(userId);
    const firstPurchaseDiscount = user?.firstPurchaseEligible ? Math.round(moneySubtotal * 0.2) : 0;
    const total = moneySubtotal - firstPurchaseDiscount;

    if ((user?.loyaltyPoints || 0) < pointsSpent) throw new BadRequestException('Not enough loyalty points');

    return { cart, items, moneySubtotal, pointsSpent, firstPurchaseDiscount, total };
  }

  async finalizeOrder(userId: string, totals: { items: any[]; moneySubtotal: number; pointsSpent: number; firstPurchaseDiscount: number; total: number }, payment?: { intentId?: string; status?: PaymentStatus; methodBrand?: string; last4?: string }) {
    // Update stocks
    const uid = new Types.ObjectId(userId);
    const cart = await this.cartModel.findOne({ userId: uid }).exec();
    if (!cart) throw new BadRequestException('Cart not found');
    for (const it of cart.items) {
      await this.productModel.updateOne({ _id: it.productId }, { $inc: { stock: -it.qty } }).exec();
    }

    const moneyPerPoint = Number(process.env.LOYALTY_MONEY_PER_POINT) || 100;
    const earnedPoints = Math.floor((totals.total || 0) / moneyPerPoint);

    const order = await new this.orderModel({
      userId: uid,
      items: totals.items,
      subtotal: totals.moneySubtotal,
      discountMoney: totals.firstPurchaseDiscount,
      pointsSpent: totals.pointsSpent,
      pointsEarned: earnedPoints,
      total: totals.total,
      status: OrderStatus.PAID,
      paymentIntentId: payment?.intentId,
      paymentStatus: payment?.status ?? PaymentStatus.SUCCEEDED,
      paymentMethodBrand: payment?.methodBrand,
      paymentLast4: payment?.last4,
    }).save();

    // Loyalty adjustments
    if (totals.pointsSpent > 0) {
      await this.loyalty.spend(userId, totals.pointsSpent, order.id);
      await this.usersService.adjustLoyaltyPoints(userId, -totals.pointsSpent);
    }
    if (earnedPoints > 0) {
      await this.loyalty.earn(userId, earnedPoints, order.id);
      await this.usersService.adjustLoyaltyPoints(userId, earnedPoints);
    }

    // First purchase flag
    const user = await this.usersService.findById(userId);
    if (user?.firstPurchaseEligible) await this.usersService.setFirstPurchaseEligible(userId, false);

    // Clear cart
    await this.cartModel.updateOne({ _id: cart._id }, { $set: { items: [] } }).exec();

    // Realtime notification
    try {
      this.notifications.emitOrderStatus(userId, { orderId: String(order._id), status: 'PAID', total: totals.total });
    } catch (_) {}

    return order;
  }

  async checkout(userId: string) {
    const uid = new Types.ObjectId(userId);
    const cart = await this.cartModel.findOne({ userId: uid }).exec();
    if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');

    const productIds = cart.items.map((i) => i.productId);
    const products = await this.productModel.find({ _id: { $in: productIds } }).exec();
    const map = new Map<string, ProductDocument>(products.map((p) => [String(p._id), p]));

    let moneySubtotal = 0;
    let pointsSpent = 0;
    const items: any[] = [];

    for (const it of cart.items) {
      const p = map.get(String(it.productId));
      if (!p) throw new BadRequestException('Product missing');
      if (p.stock < it.qty) throw new BadRequestException(`Insufficient stock for ${p.title}`);

      if (p.purchaseType === PurchaseType.POINTS || (p.purchaseType === PurchaseType.HYBRID && it.chosenPayment === LinePaymentChoice.POINTS)) {
        const unitPoints = p.pricePoints || 0;
        pointsSpent += unitPoints * it.qty;
        items.push({ productId: p._id, titleSnapshot: p.title, qty: it.qty, unitPricePoints: unitPoints });
      } else {
        const unitMoney = computeUnitMoneyPrice(p);
        moneySubtotal += unitMoney * it.qty;
        items.push({ productId: p._id, titleSnapshot: p.title, qty: it.qty, unitPriceMoney: unitMoney });
      }
    }

    const user = await this.usersService.findById(userId);
    const firstPurchaseDiscount = user?.firstPurchaseEligible ? Math.round(moneySubtotal * 0.2) : 0;
    const total = moneySubtotal - firstPurchaseDiscount;

    if ((user?.loyaltyPoints || 0) < pointsSpent) throw new BadRequestException('Not enough loyalty points');

    // Update stocks
    for (const it of cart.items) {
      await this.productModel.updateOne({ _id: it.productId }, { $inc: { stock: -it.qty } }).exec();
    }

    const moneyPerPoint = Number(process.env.LOYALTY_MONEY_PER_POINT) || 100;
    const earnedPoints = Math.floor((total || 0) / moneyPerPoint);

    const order = await new this.orderModel({
      userId: new Types.ObjectId(userId),
      items,
      subtotal: moneySubtotal,
      discountMoney: firstPurchaseDiscount,
      pointsSpent,
      pointsEarned: earnedPoints,
      total,
      status: 'PAID',
    }).save();

    // Loyalty adjustments
    if (pointsSpent > 0) {
      await this.loyalty.spend(userId, pointsSpent, order.id);
      await this.usersService.adjustLoyaltyPoints(userId, -pointsSpent);
    }
    if (earnedPoints > 0) {
      await this.loyalty.earn(userId, earnedPoints, order.id);
      await this.usersService.adjustLoyaltyPoints(userId, earnedPoints);
    }

    // First purchase flag
    if (user?.firstPurchaseEligible) await this.usersService.setFirstPurchaseEligible(userId, false);

    // Clear cart
    await this.cartModel.updateOne({ _id: cart._id }, { $set: { items: [] } }).exec();

    // Realtime notification
    try {
      this.notifications.emitOrderStatus(userId, { orderId: String(order._id), status: 'PAID', total });
    } catch (_) {}

    return order;
  }

  async listMine(userId: string) {
    const uid = new Types.ObjectId(userId);
    return this.orderModel.find({ userId: uid }).sort({ createdAt: -1 }).exec();
  }

  async get(userId: string, id: string) {
    const uid = new Types.ObjectId(userId);
    return this.orderModel.findOne({ _id: id, userId: uid }).exec();
  }

  // ============ Admin APIs ============
  async adminList(params: { status?: OrderStatus; from?: string; to?: string; q?: string; page: number; limit: number }) {
    const { status, from, to, q, page, limit } = params;
    const filter: any = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {} as any;
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (q) {
      filter['items.titleSnapshot'] = { $regex: q, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async adminUpdateStatus(id: string, status: OrderStatus) {
    await this.orderModel.updateOne({ _id: id }, { $set: { status } }).exec();
    return this.orderModel.findById(id).exec();
  }

  async metricsOverview() {
    const [agg] = await this.orderModel.aggregate([
      {
        $group: {
          _id: null,
          ordersCount: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]).exec();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [salesToday, salesThisMonth] = await Promise.all([
      this.orderModel.aggregate([{ $match: { createdAt: { $gte: today, $lt: tomorrow } } }, { $group: { _id: null, total: { $sum: '$total' } } }]).exec(),
      this.orderModel.aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$total' } } }]).exec(),
    ]);

    return {
      ordersCount: agg?.ordersCount || 0,
      totalRevenue: agg?.totalRevenue || 0,
      avgOrderValue: Math.round((agg?.avgOrderValue || 0)),
      salesToday: salesToday?.[0]?.total || 0,
      salesThisMonth: salesThisMonth?.[0]?.total || 0,
    };
  }

  async salesSeries(params: { from?: string; to?: string; granularity?: 'day' | 'month' }) {
    const { from, to, granularity = 'day' } = params;
    const match: any = {};
    if (from || to) {
      match.createdAt = {} as any;
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const format = granularity === 'month' ? '%Y-%m' : '%Y-%m-%d';
    const series = await this.orderModel
      .aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .exec();
    return series.map((s) => ({ date: s._id, revenue: s.revenue, orders: s.orders }));
  }

  async topProducts(params: { limit?: number; from?: string; to?: string }) {
    const { limit = 5, from, to } = params;
    const match: any = {};
    if (from || to) {
      match.createdAt = {} as any;
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const results = await this.orderModel
      .aggregate([
        { $match: match },
        { $unwind: '$items' },
        {
          $addFields: {
            lineRevenue: {
              $cond: [
                { $ifNull: ['$items.unitPriceMoney', false] },
                { $multiply: ['$items.unitPriceMoney', '$items.qty'] },
                0,
              ],
            },
          },
        },
        {
          $group: {
            _id: '$items.productId',
            title: { $last: '$items.titleSnapshot' },
            qty: { $sum: '$items.qty' },
            revenue: { $sum: '$lineRevenue' },
          },
        },
        { $sort: { qty: -1, revenue: -1 } },
        { $limit: limit },
      ])
      .exec();
    return results.map((r) => ({ productId: r._id, title: r.title, qty: r.qty, revenue: r.revenue }));
  }
}
