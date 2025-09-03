import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Car, CarDocument } from './car.schema';

@Injectable()
export class CarsService {
  constructor(@InjectModel(Car.name) private model: Model<CarDocument>) {}

  create(ownerId: any, dto: any, session?: any) {
    if (session) {
      return this.model.create([{ ...dto, owner: new Types.ObjectId(ownerId) }], { session }).then(r => r[0]);
    }
    return this.model.create({ ...dto, owner: new Types.ObjectId(ownerId) });
  }

  async findOne(id: any) {
    const car = await this.model.findById(id).lean();
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }

  async list(query: any) {
    const { make, model, bodyType, yearMin, yearMax, owner, page = 1, limit = 10 } = query;
    const q: any = {};
    if (make) q.make = make;
    if (model) q.model = model;
    if (bodyType) q.bodyType = bodyType;
    if (owner) q.owner = new Types.ObjectId(owner);
    if (yearMin || yearMax) q.year = {};
    if (yearMin) q.year.$gte = Number(yearMin);
    if (yearMax) q.year.$lte = Number(yearMax);
    const skip = (Number(page)-1) * Number(limit);
    const [items, total] = await Promise.all([
      this.model.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      this.model.countDocuments(q)
    ]);
    return { items, total, page: Number(page), limit: Number(limit) };
  }

  update(ownerId: any, id: any, patch: any) {
    return this.model.findOneAndUpdate({ _id: id, owner: ownerId }, patch, { new: true }).lean();
  }

  remove(ownerId: any, id: any) {
    return this.model.findOneAndDelete({ _id: id, owner: ownerId }).lean();
  }
}
