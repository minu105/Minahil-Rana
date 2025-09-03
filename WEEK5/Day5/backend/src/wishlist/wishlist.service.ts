import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist } from './wishlist.schema';
import { Auction, AuctionDocument } from '../auctions/auction.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private model: Model<Wishlist>,
    @InjectModel(Auction.name) private auctions: Model<AuctionDocument>
  ) {}

  async add(userId: any, carId: any) {
    try { console.log('[Wishlist.add] userId=', userId, 'carId=', carId); } catch {}
    // Validate car and ensure user is not the owner
    const carsColl = (this.model as any).db.collection('cars');
    const carObjId = new Types.ObjectId(carId);
    const car: any = await carsColl.findOne({ _id: carObjId });
    if (!car) throw new NotFoundException('Car not found');
    if (car.owner && car.owner.toString() === userId.toString()) {
      throw new BadRequestException('You cannot add your own car to wishlist');
    }

    // Upsert to avoid duplicate key error on unique (user, car)
    const res = await this.model.findOneAndUpdate(
      { user: new Types.ObjectId(userId), car: carObjId },
      { $setOnInsert: { user: new Types.ObjectId(userId), car: carObjId } },
      { upsert: true, new: true }
    ).lean();
    try { console.log('[Wishlist.add] upserted id=', res?._id?.toString()); } catch {}
    return res;
  }
  async list(userId: any) {
    try { console.log('[Wishlist.list] userId=', userId); } catch {}
    const items = await this.model.find({ user: new Types.ObjectId(userId) }).lean();
    try { console.log('[Wishlist.list] raw items count=', items.length); } catch {}
    const carIds = Array.from(new Set(items.map(i => i.car?.toString()).filter(Boolean)));
    // fetch cars and their latest auction (live -> scheduled -> ended by most recent endAt)
    const carsColl = (this.model as any).db.collection('cars');
    const carsArr = carIds.length ? await carsColl.find({ _id: { $in: carIds.map((id: string) => new Types.ObjectId(id)) } }).toArray() : [];
    const carMap = new Map(carsArr.map((c: any) => [c._id.toString(), c] as const));

    // Ensure we query auctions using ObjectIds (strings in $in may not match)
    const carObjIds = carIds.map((id: string) => new Types.ObjectId(id));
    const auctions = await this.auctions.find({ car: { $in: carObjIds } }).lean();
    try { console.log('[Wishlist.list] cars found=', carsArr.length, 'auctions found=', auctions.length); } catch {}
    // pick preferred auction per car: live first, else scheduled soonest, else most recent ended
    const auctionByCar = new Map<string, any>();
    for (const a of auctions) {
      const key = a.car?.toString();
      if (!key) continue;
      const current = auctionByCar.get(key);
      if (!current) { auctionByCar.set(key, a); continue; }
      const rank = (x: any) => x.status === 'live' ? 3 : (x.status === 'scheduled' ? 2 : 1);
      const better = (rank(a) > rank(current)) || (rank(a) === rank(current) && new Date(a.endAt).getTime() > new Date(current.endAt).getTime());
      if (better) auctionByCar.set(key, a);
    }

    const out = items.map(w => {
      const car = w.car ? carMap.get(w.car.toString()) : null;
      const auction = w.car ? auctionByCar.get(w.car.toString()) : null;
      return { _id: w._id, car, auction, createdAt: (w as any).createdAt };
    });
    try { console.log('[Wishlist.list] returning items=', out.length); } catch {}
    return out;
  }
  remove(id: string, userId: any) {
    return this.model.findOneAndDelete({ _id: id, user: userId }).lean();
  }

  async addByAuction(userId: any, auctionId: string) {
    try { console.log('[Wishlist.addByAuction] userId=', userId, 'auctionId=', auctionId); } catch {}
    const auction = await this.auctions.findById(auctionId).lean();
    if (!auction) throw new NotFoundException('Auction not found');
    if (!auction.car) throw new BadRequestException('Auction missing car');
    if (auction.seller && auction.seller.toString() === userId.toString()) {
      throw new BadRequestException('You cannot add your own car to wishlist');
    }
    // Upsert directly using auction.car without requiring car doc existence
    const res = await this.model.findOneAndUpdate(
      { user: new Types.ObjectId(userId), car: new Types.ObjectId(auction.car) },
      { $setOnInsert: { user: new Types.ObjectId(userId), car: new Types.ObjectId(auction.car) } },
      { upsert: true, new: true }
    ).lean();
    try { console.log('[Wishlist.addByAuction] upserted id=', res?._id?.toString()); } catch {}
    return res;
  }
}
