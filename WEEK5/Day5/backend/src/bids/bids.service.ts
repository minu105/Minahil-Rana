import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Auction, AuctionDocument } from '../auctions/auction.schema';
import { Bid, BidDocument } from './bid.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeGateway } from '../realtime/socket.gateway';

@Injectable()
export class BidsService {
  constructor(
    @InjectModel(Bid.name) private bidModel: Model<BidDocument>,
    @InjectModel(Auction.name) private auctionModel: Model<AuctionDocument>,
    @InjectConnection() private connection: Connection,
    private notifications: NotificationsService,
    private gateway: RealtimeGateway
  ) {}

  async placeBid(auctionId: string, bidderId: string, amount: number) {
    const now = new Date();
    const auction = await this.auctionModel.findById(auctionId).lean();
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.seller.toString() === bidderId.toString())
      throw new BadRequestException('Cannot bid on your own car');
    if (auction.status !== 'live' || now < new Date(auction.startAt) || now >= new Date(auction.endAt))
      throw new BadRequestException('Auction not active');

    const currentTop = auction.topBid?.amount ?? auction.startPrice;
    const previousTopBidder: any = (auction as any)?.topBid?.user || (auction as any)?.topBid?.bidder || null;
    if (amount < currentTop + auction.minIncrement)
      throw new BadRequestException('Bid too low');

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const expected = auction.topBid?.amount ?? null;
      const update = await this.auctionModel.findOneAndUpdate(
        {
          _id: auction._id,
          status: 'live',
          endAt: { $gt: now },
          ...(expected === null ? { topBid: { $exists: false } } : { 'topBid.amount': expected })
        },
        { $set: { topBid: { amount, user: new Types.ObjectId(bidderId), bidId: new Types.ObjectId() } } },
        { session, new: true }
      ).lean();

      if (!update) throw new ConflictException('Concurrent bid or outdated amount');

      if (!update.topBid) throw new ConflictException('Top bid not set properly'); // ✅ safeguard

      const bid = await this.bidModel.create([{
        _id: update.topBid.bidId,  // ✅ ab safe hai
        auction: auction._id,
        bidder: new Types.ObjectId(bidderId),
        amount
      }], { session }).then(r => r[0]);

      await session.commitTransaction();

      // Notify seller about new bid
      this.notifications.createAndEmit(auction.seller, 'new_bid', {
        auctionId,
        bidderId,
        amount,
        message: `New bid of $${amount} placed on your auction`
      });

      // Notify previous top bidder that they have been outbid
      if (previousTopBidder && previousTopBidder.toString() !== bidderId.toString()) {
        this.notifications.createAndEmit(previousTopBidder, 'outbid', {
          auctionId,
          newAmount: amount,
          message: `You have been outbid with a new bid of $${amount}. Place a higher bid to get back on top.`
        });
      }

      // Broadcast to auction room for live updates on the page
      this.gateway.emitToRoom(`auction:${auctionId}`, 'newBid', {
        auctionId,
        bidderId,
        amount,
        bidId: bid._id
      });

      return bid;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  list(auctionId: string, page = 1, limit = 20) {
    const skip = (Number(page)-1)*Number(limit);
    return this.bidModel.find({ auction: auctionId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean();
  }

  async listForUser(userId: string, page = 1, limit = 20) {
    const skip = (Number(page)-1)*Number(limit);
    const [items, total] = await Promise.all([
      this.bidModel.find({ bidder: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      this.bidModel.countDocuments({ bidder: new Types.ObjectId(userId) })
    ]);

    const auctionIds = Array.from(new Set(items.map(i => i.auction?.toString()).filter(Boolean)));
    const auctions = await this.auctionModel.find({ _id: { $in: auctionIds } }).lean();
    const carIds = Array.from(new Set(auctions.map(a => a.car?.toString()).filter(Boolean)));
    // late import to avoid circular deps; using connection model registry is overkill here, so keep simple map shape
    const carsColl = this.connection.collection('cars');
    const carsArr = carIds.length ? await carsColl.find({ _id: { $in: carIds.map(id => new Types.ObjectId(id)) } }).toArray() : [];
    const auctionMap = new Map(auctions.map(a => [a._id.toString(), a] as const));
    const carMap = new Map(carsArr.map((c: any) => [c._id.toString(), c] as const));

    // count bids per auction
    const countsArr = auctionIds.length ? await this.bidModel.aggregate([
      { $match: { auction: { $in: auctionIds.map(id => new Types.ObjectId(id)) } } },
      { $group: { _id: "$auction", count: { $sum: 1 } } }
    ]) : [] as any[];
    const countMap = new Map(countsArr.map((r: any) => [r._id.toString(), r.count] as const));

    const hydrated = items.map(b => {
      const auc: any = auctionMap.get(b.auction?.toString() || '') || null;
      const car: any = auc && auc.car ? carMap.get(auc.car.toString()) : null;
      const totalBids = auc ? (countMap.get(auc._id.toString()) || 0) : 0;
      return { bid: b, auction: auc, car, totalBids };
    });

    return { items: hydrated, total, page: Number(page), limit: Number(limit) };
  }
}
