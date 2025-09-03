import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { LoyaltyService } from './loyalty.service';

@Controller('loyalty')
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  @Get('balance')
  balance(@Req() req: any) {
    return { balance: req.user.loyaltyPoints };
  }

  @Get('transactions')
  history(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.history(req.user.id, Number(page), Number(limit));
  }
}
