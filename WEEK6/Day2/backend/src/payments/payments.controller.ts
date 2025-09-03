import { Controller, Post, Req, Headers, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createIntent(@Req() req: any) {
    const userId = req.user.id as string;
    return this.payments.createPaymentIntent(userId);
  }

  // Note: raw body parsing is configured in main.ts for this path
  @Post('webhook')
  async webhook(@Req() req: any, @Headers('stripe-signature') sig?: string) {
    const raw = req.rawBody as Buffer;
    return this.payments.handleWebhook(raw, sig);
  }
}
