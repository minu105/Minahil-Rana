import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Get('product/:productId')
  list(@Param('productId') productId: string) {
    return this.service.list(productId);
  }

  @Post('product/:productId')
  @UseGuards(JwtAuthGuard)
  add(@Req() req: any, @Param('productId') productId: string, @Body() body: { rating: number; comment?: string }) {
    return this.service.add(req.user.id, productId, body.rating, body.comment);
  }
}
