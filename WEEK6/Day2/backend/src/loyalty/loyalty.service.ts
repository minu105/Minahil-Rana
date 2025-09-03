import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoyaltyTransaction, LoyaltyTransactionDocument, LoyaltyType } from './schemas/loyalty-transaction.schema';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectModel(LoyaltyTransaction.name)
    private model: Model<LoyaltyTransactionDocument>,
  ) {}

  async earn(userId: string, points: number, orderId?: string, reason = 'ORDER_EARN') {
    return this.model.create({ userId: new Types.ObjectId(userId), type: LoyaltyType.EARN, points, orderId, reason });
  }

  async spend(userId: string, points: number, orderId?: string, reason = 'ORDER_SPEND') {
    return this.model.create({ userId: new Types.ObjectId(userId), type: LoyaltyType.SPEND, points: -Math.abs(points), orderId, reason });
  }

  async history(userId: string, page = 1, limit = 20) {
    const docs = await this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const total = await this.model.countDocuments({ userId });
    return { items: docs, total, page, limit };
  }
}
