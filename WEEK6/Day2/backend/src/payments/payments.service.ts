import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';
import { PaymentStatus } from '../orders/schemas/order.schema';

@Injectable()
export class PaymentsService {
  private stripe?: Stripe;
  private currency: string;

  constructor(private config: ConfigService, private orders: OrdersService) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    this.currency = this.config.get<string>('CURRENCY') || 'usd';
    if (!key) {
      // Non-fatal during boot so admin dashboard can run without Stripe configured
      // Endpoints will guard against missing configuration
      // eslint-disable-next-line no-console
      console.warn('Stripe not configured: STRIPE_SECRET_KEY missing');
      return;
    }
    this.stripe = new Stripe(key);
  }

  async createPaymentIntent(userId: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured on server');
    }
    const totals = await this.orders.computeCartTotals(userId);

    // Create PaymentIntent with user metadata for webhook correlation
    const pi = await this.stripe.paymentIntents.create({
      amount: totals.total,
      currency: this.currency,
      metadata: { userId },
      automatic_payment_methods: { enabled: true },
    });

    return { clientSecret: pi.client_secret, paymentIntentId: pi.id };
  }

  verifyAndParseStripeEvent(rawBody: Buffer, signature: string | undefined) {
    if (!this.stripe) throw new Error('Stripe not configured on server');
    const endpointSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!endpointSecret) throw new Error('STRIPE_WEBHOOK_SECRET missing');
    if (!signature) throw new Error('Missing Stripe-Signature header');

    const event = this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    return event;
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!this.stripe) throw new Error('Stripe not configured on server');
    const event = this.verifyAndParseStripeEvent(rawBody, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const userId = (pi.metadata && (pi.metadata as any).userId) as string | undefined;
        if (!userId) break;

        const pmId = typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method?.id;
        let brand: string | undefined;
        let last4: string | undefined;
        if (pmId) {
          const pm = await this.stripe.paymentMethods.retrieve(pmId as string);
          if (pm.card) {
            brand = pm.card.brand || undefined;
            last4 = pm.card.last4 || undefined;
          }
        }

        const totals = await this.orders.computeCartTotals(userId);
        await this.orders.finalizeOrder(userId, totals, {
          intentId: pi.id,
          status: PaymentStatus.SUCCEEDED,
          methodBrand: brand,
          last4,
        });
        break;
      }
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
      default:
        // No-op for now
        break;
    }

    return { received: true };
  }
}
