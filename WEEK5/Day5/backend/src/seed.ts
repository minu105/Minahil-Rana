import 'dotenv/config';
import { connect, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserSchema } from './users/user.schema';
import { Car, CarSchema } from './cars/car.schema';
import { Auction, AuctionSchema } from './auctions/auction.schema';
import { model } from 'mongoose';

async function run() {
  await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auction_hackathon');
  const UserModel = model<User>('User', UserSchema);
  const CarModel = model<Car>('Car', CarSchema);
  const AuctionModel = model<Auction>('Auction', AuctionSchema);

  const seller = await UserModel.create({ name: 'Seller', email: 'seller@example.com', passwordHash: await bcrypt.hash('password', 12) });
  const buyer = await UserModel.create({ name: 'Buyer', email: 'buyer@example.com', passwordHash: await bcrypt.hash('password', 12) });

  const car = await CarModel.create({
    owner: seller._id, title: 'BMW M4', make: 'BMW', model: 'M4', year: 2022,
    bodyType: 'sports', photos: ['https://picsum.photos/seed/m4/800/600']
  });

  const now = new Date();
  const startAt = new Date(now.getTime() + 15000); // 15s
  const endAt = new Date(now.getTime() + 75000);   // 75s
  await AuctionModel.create({ car: car._id, seller: seller._id, startPrice: 10000, minIncrement: 100, startAt, endAt, status: 'scheduled' });

  console.log('Seeded users:');
  console.log('Seller -> email: seller@example.com / password: password');
  console.log('Buyer  -> email: buyer@example.com  / password: password');
  process.exit(0);
}
run();
