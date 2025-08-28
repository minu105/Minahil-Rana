// followers.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowersController } from './followers.controller';
import { FollowersService } from './followers.service';
import { Follower, FollowerSchema } from './follower.schema';
import { User, UserSchema } from '../auth/user.schema';
import { NotificationsModule } from '../notifications/notifications.module'; // 👈 add this

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Follower.name, schema: FollowerSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule, // 👈 add this
  ],
  controllers: [FollowersController],
  providers: [FollowersService],
})
export class FollowersModule {}
