import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { ProductsService } from './products.service';
import { SaleAutoEndScheduler } from './sale.scheduler';
import { ProductsController } from './products.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    NotificationsModule,
  ],
  providers: [ProductsService, SaleAutoEndScheduler],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
