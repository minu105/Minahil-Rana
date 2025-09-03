import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { Wishlist, WishlistSchema } from './wishlist.schema';
import { Auction, AuctionSchema } from '../auctions/auction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Auction.name, schema: AuctionSchema },
    ])
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
