import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class SaleAutoEndScheduler implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private notifications: NotificationsGateway,
  ) {}

  onModuleInit() {
    // run immediately at startup, then every 60s
    this.tick().catch(() => {});
    this.timer = setInterval(() => this.tick().catch(() => {}), 60_000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer as NodeJS.Timeout);
  }

  private async tick() {
    const now = new Date();
    // 1) Emit sale start if window has started and not yet notified
    const toStart = await this.productModel.find({
      onSale: true,
      $or: [
        { saleStartAt: null },
        { saleStartAt: { $exists: false } },
        { saleStartAt: { $lte: now } },
      ],
      saleNotifiedStart: { $ne: true },
    }).select({ _id: 1 }).lean();
    for (const p of toStart) {
      this.notifications.emitSale(String(p._id), 'Sale is live');
      await this.productModel.updateOne({ _id: p._id }, { $set: { saleNotifiedStart: true } }).exec();
    }

    // 2) Emit 10-min warning if approaching end and not yet notified
    const tenMinLater = new Date(now.getTime() + 10 * 60 * 1000);
    const toWarn = await this.productModel.find({
      onSale: true,
      saleEndAt: { $ne: null, $exists: true, $lte: tenMinLater, $gt: now },
      saleNotifiedTenMin: { $ne: true },
    }).select({ _id: 1, saleEndAt: 1 }).lean();
    for (const p of toWarn) {
      this.notifications.emitSale(String(p._id), 'Sale ends in 10 minutes');
      await this.productModel.updateOne({ _id: p._id }, { $set: { saleNotifiedTenMin: true } }).exec();
    }

    // 3) Emit end and disable sales that have passed end
    const toEnd = await this.productModel.find({
      onSale: true,
      saleEndAt: { $ne: null, $exists: true, $lte: now },
    }).select({ _id: 1 }).lean();
    for (const p of toEnd) {
      this.notifications.emitSale(String(p._id), 'Sale ended');
      await this.productModel.updateOne(
        { _id: p._id },
        { $set: { onSale: false, salePrice: undefined, discountPercent: undefined, saleStartAt: undefined, saleEndAt: undefined, saleNotifiedEnd: true } }
      ).exec();
    }
  }
}
