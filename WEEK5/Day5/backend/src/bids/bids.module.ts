import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BidsController, MyBidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { Bid, BidSchema } from './bid.schema';
import { AuctionsModule } from '../auctions/auctions.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Auction, AuctionSchema } from '../auctions/auction.schema';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bid.name, schema: BidSchema },
      { name: Auction.name, schema: AuctionSchema },
    ]),
    forwardRef(() => AuctionsModule),
    NotificationsModule,
    RealtimeModule,
  ],
  controllers: [BidsController, MyBidsController],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}
