import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { BidsService } from './bids.service';
import { PlaceBidDto } from './dtos';

@Controller('api/auctions/:id/bids')
export class BidsController {
  constructor(private bids: BidsService) {}

  @Get()
  list(@Param('id') id: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.bids.list(id, Number(page), Number(limit));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  place(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: PlaceBidDto) {
    return this.bids.placeBid(id, user._id, dto.amount);
  }
}

@Controller('api/bids')
@UseGuards(JwtAuthGuard)
export class MyBidsController {
  constructor(private bids: BidsService) {}

  @Get('mine')
  myBids(@CurrentUser() user: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.bids.listForUser(user._id, Number(page), Number(limit));
  }
}
