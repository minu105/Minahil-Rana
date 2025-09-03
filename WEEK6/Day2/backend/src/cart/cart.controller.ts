import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { LinePaymentChoice } from './schemas/cart.schema';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  me(@Req() req: any) {
    return this.service.getComputed(req.user.id);
  }

  @Post('items')
  add(@Req() req: any, @Body() body: { productId: string; qty?: number; chosenPayment?: LinePaymentChoice }) {
    return this.service.addItem(req.user.id, body.productId, body.qty || 1, body.chosenPayment);
  }

  @Patch('items/:productId')
  update(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body() body: { qty: number; chosenPayment?: LinePaymentChoice },
  ) {
    return this.service.updateItem(req.user.id, productId, body.qty, body.chosenPayment);
  }

  @Delete('items/:productId')
  remove(@Req() req: any, @Param('productId') productId: string) {
    return this.service.removeItem(req.user.id, productId);
  }

  @Delete('clear')
  clear(@Req() req: any) {
    return this.service.clear(req.user.id);
  }
}
