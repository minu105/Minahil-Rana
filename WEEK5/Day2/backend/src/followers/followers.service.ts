import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Follower, FollowerDocument } from './follower.schema';

@Injectable()
export class FollowersService {
  constructor(
    @InjectModel(Follower.name) private followerModel: Model<FollowerDocument>,
  ) {}

  async follow(followerId: string, followeeId: string) {
    const existing = await this.followerModel.findOne({
      follower: followerId,
      followee: followeeId,
    });

    if (existing) return existing;

    const created = new this.followerModel({
      follower: followerId,
      followee: followeeId,
    });

    return created.save();
  }

  async unfollow(followerId: string, followeeId: string) {
    return this.followerModel.deleteOne({
      follower: followerId,
      followee: followeeId,
    });
  }

  async status(followerId: string, followeeId: string) {
    const existing = await this.followerModel.findOne({
      follower: followerId,
      followee: followeeId,
    });
    return { following: !!existing };
  }

  async counts(userId: string) {
    const followers = await this.followerModel.countDocuments({
      followee: userId,
    });
    const following = await this.followerModel.countDocuments({
      follower: userId,
    });

    return { followers, following };
  }
}
