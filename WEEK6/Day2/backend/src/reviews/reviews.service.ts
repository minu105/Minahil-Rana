import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async canReview(userId: string, productId: string) {
    const uid = new Types.ObjectId(userId);
    const pid = new Types.ObjectId(productId);
    const count = await this.orderModel
      .countDocuments({ userId: uid, 'items.productId': pid })
      .exec();
    return count > 0;
  }

  async add(userId: string, productId: string, rating: number, comment?: string) {
    const ok = await this.canReview(userId, productId);
    if (!ok) throw new BadRequestException('You can only review products you purchased');

    const uid = new Types.ObjectId(userId);
    const pid = new Types.ObjectId(productId);
    const review = await this.reviewModel.findOneAndUpdate(
      { userId: uid, productId: pid },
      { $set: { rating, comment } },
      { upsert: true, new: true },
    );

    // Recompute product rating
    const agg = await this.reviewModel.aggregate([
      { $match: { productId: pid } },
      { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count = 0 } = agg[0] || {};
    await this.productModel.updateOne({ _id: pid }, { $set: { ratingAvg: avg, ratingCount: count } }).exec();

    return review;
  }

  list(productId: string) {
    const pid = new Types.ObjectId(productId);
    return this.reviewModel.find({ productId: pid }).sort({ createdAt: -1 }).exec();
  }
}
