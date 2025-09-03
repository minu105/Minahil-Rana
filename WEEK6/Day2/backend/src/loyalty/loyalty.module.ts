import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyTransaction, LoyaltyTransactionSchema } from './schemas/loyalty-transaction.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: LoyaltyTransaction.name, schema: LoyaltyTransactionSchema }])],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
