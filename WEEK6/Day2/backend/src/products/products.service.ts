import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private model: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  private toObjectIdOrThrow(id: string, field = 'id') {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${field}: must be a 24-hex ObjectId`);
    }
    return new Types.ObjectId(id);
  }

  private mapObjectIdsOrThrow(ids: string[] = [], field = 'id') {
    return ids.map((x, idx) => this.toObjectIdOrThrow(x, `${field}[${idx}]`));
  }

  async create(dto: CreateProductDto) {
    const created = new this.model({
      ...dto,
      categories: this.mapObjectIdsOrThrow(dto.categories, 'categories'),
      images: dto.images || [],
    });
    return created.save();
  }

  async list(params: { search?: string; category?: string; sort?: string; page?: number; limit?: number }) {
    const { search, category, sort = 'new', page = 1, limit = 12 } = params;
    const filter: FilterQuery<ProductDocument> = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (category) filter.categories = this.toObjectIdOrThrow(category, 'category');

    const query = this.model.find(filter);

    if (sort === 'new') query.sort({ createdAt: -1 });
    else if (sort === 'top-selling') query.sort({ ratingCount: -1 });
    else if (sort === 'price-asc') query.sort({ basePrice: 1 });
    else if (sort === 'price-desc') query.sort({ basePrice: -1 });

    const docs = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const total = await this.model.countDocuments(filter);
    return { items: docs, total, page, limit };
  }

  async getById(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Product not found');
    return doc;
  }

  async update(id: string, dto: UpdateProductDto) {
    const updated = await this.model
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...dto,
            categories: dto.categories ? this.mapObjectIdsOrThrow(dto.categories, 'categories') : undefined,
          },
        },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Product not found');
    return { success: true };
  }

  async addCategories(id: string, categoryIds: string[]) {
    const cats = this.mapObjectIdsOrThrow(categoryIds, 'categoryIds');
    const updated = await this.model
      .findByIdAndUpdate(
        id,
        { $addToSet: { categories: { $each: cats } } },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async removeCategories(id: string, categoryIds: string[]) {
    const cats = this.mapObjectIdsOrThrow(categoryIds, 'categoryIds');
    const updated = await this.model
      .findByIdAndUpdate(
        id,
        { $pull: { categories: { $in: cats } } },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async setSale(id: string, body: { onSale: boolean; salePrice?: number; discountPercent?: number; saleStartAt?: string; saleEndAt?: string }) {
    const { onSale, salePrice, discountPercent } = body;
    const saleStartAt = body.saleStartAt ? new Date(body.saleStartAt) : undefined;
    const saleEndAt = body.saleEndAt ? new Date(body.saleEndAt) : undefined;

    if (onSale) {
      if ((salePrice == null || isNaN(Number(salePrice))) && (discountPercent == null || isNaN(Number(discountPercent)))) {
        throw new Error('When enabling sale, provide salePrice or discountPercent');
      }
      if (saleStartAt && saleEndAt && saleStartAt >= saleEndAt) {
        throw new Error('saleStartAt must be before saleEndAt');
      }
    }

    const $set: any = {
      onSale,
      salePrice: salePrice,
      discountPercent: discountPercent,
    };
    if (onSale) {
      if (saleStartAt) $set.saleStartAt = saleStartAt;
      else $set.saleStartAt = undefined;
      if (saleEndAt) $set.saleEndAt = saleEndAt;
      else $set.saleEndAt = undefined;
    } else {
      // when disabling sale, clear all sale fields
      $set.salePrice = undefined;
      $set.discountPercent = undefined;
      $set.saleStartAt = undefined;
      $set.saleEndAt = undefined;
    }

    const updated = await this.model
      .findByIdAndUpdate(
        id,
        { $set },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async adjustStock(id: string, delta: number) {
    const updated = await this.model.findByIdAndUpdate(id, { $inc: { stock: delta } }, { new: true }).exec();
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async newArrivals(limit = 6) {
    const items = await this.model.find().sort({ createdAt: -1 }).limit(limit).exec();
    return { items };
  }

  async topSelling(limit = 6) {
    const pipeline: any[] = [
      { $unwind: { path: '$items' } },
      { $group: { _id: '$items.productId', qty: { $sum: '$items.qty' } } },
      { $sort: { qty: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: this.model.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product' } },
      { $project: { product: 1, qty: 1 } },
    ];
    const agg = await this.orderModel.aggregate(pipeline as any).exec();
    const items = agg.map((x: any) => ({ ...x.product, salesQty: x.qty }));
    return { items };
  }
}
