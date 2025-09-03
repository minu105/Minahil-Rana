import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { Auction, AuctionSchema } from './auction.schema';
import { CarsModule } from '../cars/cars.module';
import { AuctionsScheduler } from './auctions.scheduler';
import { Bid, BidSchema } from '../bids/bid.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auction.name, schema: AuctionSchema },
      { name: Bid.name, schema: BidSchema },
    ]),
    CarsModule,
    NotificationsModule,
    RealtimeModule,
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsScheduler],
  exports: [AuctionsService]
})
export class AuctionsModule {}
