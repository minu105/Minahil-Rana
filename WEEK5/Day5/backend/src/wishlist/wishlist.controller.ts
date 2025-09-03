import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { WishlistService } from './wishlist.service';

@Controller('api/wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wish: WishlistService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(@CurrentUser() user: any, @Body('carId') carId: string) { 
    const result = await this.wish.add(user._id, carId);
    return { success: true, data: result };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@CurrentUser() user: any) { 
    const result = await this.wish.list(user._id);
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async del(@CurrentUser() user: any, @Param('id') id: string) { 
    const result = await this.wish.remove(id, user._id);
    return { success: true, data: result };
  }

  // Add by auctionId: will resolve the auction and add its car to wishlist
  @Post('by-auction/:auctionId')
  @HttpCode(HttpStatus.CREATED)
  async addByAuction(@CurrentUser() user: any, @Param('auctionId') auctionId: string) {
    const result = await this.wish.addByAuction(user._id, auctionId);
    return { success: true, data: result };
  }
}
