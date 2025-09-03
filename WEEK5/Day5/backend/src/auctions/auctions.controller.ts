import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CreateAuctionDto, CreateAuctionWithCarDto, UpdateAuctionDto } from './dtos';

@Controller('api/auctions')
export class AuctionsController {
  constructor(private auctions: AuctionsService) {}

  @Get()
  list(@Query() q: any) { return this.auctions.list(q); }

  @Get(':id')
  get(@Param('id') id: string) { return this.auctions.get(id); }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateAuctionDto) {
    return this.auctions.create(user._id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('with-car')
  createWithCar(@CurrentUser() user: any, @Body() dto: CreateAuctionWithCarDto) {
    return this.auctions.createWithCar(user._id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateAuctionDto) {
    return this.auctions.updateSeller(user._id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.auctions.cancel(user._id, id);
  }
}
