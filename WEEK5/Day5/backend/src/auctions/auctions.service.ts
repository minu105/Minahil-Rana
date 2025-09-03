import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Auction, AuctionDocument } from './auction.schema';
import { CarsService } from '../cars/cars.service';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectModel(Auction.name) private model: Model<AuctionDocument>,
    @InjectConnection() private connection: Connection,
    private cars: CarsService
  ) {}

  async create(userId: any, dto: any) {
    const car = await this.cars.findOne(dto.carId);
    if (car.owner.toString() !== userId.toString()) throw new BadRequestException('You must own this car');
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (endAt <= startAt) throw new BadRequestException('endAt must be after startAt');
    
    const now = new Date();
    let status = 'scheduled';
    if (now >= startAt && now < endAt) {
      status = 'live';
    } else if (now >= endAt) {
      status = 'ended';
    }
    
    const auction = await this.model.create({
      car: new Types.ObjectId(dto.carId),
      seller: new Types.ObjectId(userId),
      startPrice: dto.startPrice,
      minIncrement: dto.minIncrement ?? 100,
      startAt, endAt, status
    });

    // Real-time notifications removed for now

    return auction;
  }

  async get(id: any) {
    const auction = await this.model.findById(id).lean();
    if (!auction) throw new NotFoundException('Auction not found');
    return auction;
  }

  async list(q: any) {
    const {
      status,
      page = 1,
      limit = 10,
      make,
      model,
      year,
      bodyType,
      priceMin,
      priceMax,
      q: text
    } = q;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build $match for auction-level fields first
    const matchAuction: any = {};
    if (status) matchAuction.status = status;

    // Build $match for car-level fields
    const matchCar: any = {};
    if (make) matchCar['car.make'] = make;
    if (model) matchCar['car.model'] = model;
    if (bodyType) matchCar['car.bodyType'] = bodyType;
    if (year) matchCar['car.year'] = Number(year);

    // Build price range match using computed current price
    const priceFilters: any = {};
    if (priceMin) priceFilters.$gte = Number(priceMin);
    if (priceMax) priceFilters.$lte = Number(priceMax);

    const textMatch = text ? {
      $or: [
        { 'car.title': { $regex: String(text), $options: 'i' } },
        { 'car.make': { $regex: String(text), $options: 'i' } },
        { 'car.model': { $regex: String(text), $options: 'i' } }
      ]
    } : undefined;

    const pipeline: any[] = [
      { $match: matchAuction },
      { $lookup: { from: 'cars', localField: 'car', foreignField: '_id', as: 'car' } },
      { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } },
      // Exclude auctions referencing missing cars
      { $match: { car: { $ne: null } } },
      // Compute effective current price
      { $addFields: { currentPrice: { $ifNull: ['$topBid.amount', '$startPrice'] } } },
    ];

    const combinedMatch: any = { ...matchCar };
    if (textMatch) Object.assign(combinedMatch, textMatch);
    if (Object.keys(priceFilters).length) combinedMatch.currentPrice = priceFilters;
    if (Object.keys(combinedMatch).length) pipeline.push({ $match: combinedMatch });

    pipeline.push(
      { $sort: { startAt: -1 } },
      {
        $facet: {
          items: [ { $skip: skip }, { $limit: limitNum } ],
          total: [ { $count: 'count' } ]
        }
      }
    );

    // DEBUG LOG START
    try {
      console.log('[AuctionsService.list] q =', q);
      console.log('[AuctionsService.list] pipeline stages =', pipeline.length);
    } catch {}
    // DEBUG LOG END

    const agg = await this.model.aggregate(pipeline);
    const items = (agg[0]?.items ?? []).map((it: any) => ({ ...it }));
    const total = agg[0]?.total?.[0]?.count ?? 0;
    try {
      console.log('[AuctionsService.list] result: items', items.length, 'total', total);
    } catch {}
    return { items, total, page: pageNum, limit: limitNum };
  }

  async updateSeller(userId: any, id: any, patch: any) {
    const auction = await this.model.findById(id).lean();
    if (!auction) throw new NotFoundException('Auction not found');
    // Authorize: either seller OR owner of the car can update scheduled auction
    const isSeller = auction.seller?.toString?.() === userId.toString();
    let isCarOwner = false;
    try {
      const car = await this.cars.findOne(auction.car);
      isCarOwner = car?.owner?.toString?.() === userId.toString();
    } catch {}
    if (!isSeller && !isCarOwner) {
      // keep previous external behavior but clearer semantics
      throw new BadRequestException('Only the seller or car owner can edit this auction');
    }
    if (auction.status !== 'scheduled') throw new BadRequestException('Only scheduled auctions can be edited');
    return this.model.findByIdAndUpdate(id, patch, { new: true }).lean();
  }

  async cancel(userId: any, id: any) {
    const auction = await this.model.findOne({ _id: id, seller: userId }).lean();
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.status !== 'scheduled') throw new BadRequestException('Only scheduled auctions can be cancelled');
    return this.model.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true }).lean();
  }

  async createWithCar(userId: any, dto: any) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1) Create Car
      const car = await this.cars.create(userId, {
        title: dto.title,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        bodyType: dto.bodyType,
        mileage: dto.mileage,
        engineSize: dto.engineSize,
        paintStatus: dto.paintStatus,
        hasGccSpecs: dto.hasGccSpecs,
        accidentHistory: dto.accidentHistory,
        fullServiceHistory: dto.fullServiceHistory,
        photos: dto.photos || []
      }, session);

      // 2) Validate auction window
      const startAt = new Date(dto.startAt);
      const endAt = new Date(dto.endAt);
      if (endAt <= startAt) throw new BadRequestException('endAt must be after startAt');

      // 3) Create Auction
      const now = new Date();
      let status = 'scheduled';
      if (now >= startAt && now < endAt) {
        status = 'live';
      } else if (now >= endAt) {
        status = 'ended';
      }
      
      const created = await this.model.create([{
        car: new Types.ObjectId(car._id),
        seller: new Types.ObjectId(userId),
        startPrice: dto.startPrice,
        minIncrement: dto.minIncrement ?? 100,
        startAt,
        endAt,
        status
      }], { session }).then(r => r[0]);

      await session.commitTransaction();
      
      // Real-time notifications removed for now
      
      return { car, auction: created };
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }
}
