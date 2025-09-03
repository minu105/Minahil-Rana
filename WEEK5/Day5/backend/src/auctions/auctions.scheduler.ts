import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Auction, AuctionDocument } from './auction.schema';
import { Bid, BidDocument } from '../bids/bid.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeGateway } from '../realtime/socket.gateway';

@Injectable()
export class AuctionsScheduler {
  private readonly logger = new Logger(AuctionsScheduler.name);

  constructor(
    @InjectModel(Auction.name) private model: Model<AuctionDocument>,
    @InjectModel(Bid.name) private bids: Model<BidDocument>,
    private notifications: NotificationsService,
    private gateway: RealtimeGateway
  ) {}

  // Run every minute
  @Cron('* * * * *')
  async tick() {
    const now = new Date();
    // Move scheduled -> live
    const liveRes = await this.model.updateMany({ status: 'scheduled', startAt: { $lte: now }, endAt: { $gt: now } }, { $set: { status: 'live' } });
    // Move live/scheduled -> ended
    const endRes = await this.model.updateMany({ status: { $in: ['scheduled','live'] }, endAt: { $lte: now } }, { $set: { status: 'ended' } });
    if ((liveRes.modifiedCount || 0) > 0 || (endRes.modifiedCount || 0) > 0) {
      this.logger.log(`Auction status updates: live=${liveRes.modifiedCount || 0}, ended=${endRes.modifiedCount || 0}`);
    }

    // Emit notifications for newly ended auctions which haven't been notified yet
    const endedToNotify = await this.model.find({ status: 'ended', notifiedEnded: { $ne: true } }).lean();
    for (const auc of endedToNotify) {
      const auctionId = auc._id.toString();
      const winnerId: string | null = (auc as any)?.topBid?.user ? (auc as any).topBid.user.toString() : null;
      const winningAmount: number | null = (auc as any)?.topBid?.amount ?? null;

      // Find all unique bidders for this auction
      const bidderIdsArr = await this.bids.distinct('bidder', { auction: new Types.ObjectId(auctionId) });
      const bidderIds = bidderIdsArr.map((id: any) => id.toString());

      // Notify all bidders that auction ended
      for (const uid of bidderIds) {
        this.notifications.createAndEmit(uid, 'auction_ended', {
          auctionId,
          winnerId,
          winningAmount,
          message: winnerId ? `Auction ended. Winner selected.` : `Auction ended.`
        });
      }

      // Notify winner specifically with CTA
      if (winnerId) {
        this.notifications.createAndEmit(winnerId, 'winner', {
          auctionId,
          winningAmount,
          message: `You won the auction. Proceed to the auction detail page to complete payment.`
        });
      }

      // Broadcast to auction room for live UIs
      this.gateway.emitToRoom(`auction:${auctionId}`, 'auctionEnded', {
        auctionId,
        winnerId,
        winningAmount
      });

      // Mark as notified
      await this.model.updateOne({ _id: auc._id }, { $set: { notifiedEnded: true } });
    }
  }
}
