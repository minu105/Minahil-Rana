import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserSchema } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findByEmail(email: string) {
    const u = await this.userModel.findOne({ email }).exec();
    if (!u) return null;

    return {
      id: (u._id as any).toString(),   // 👈 fix applied
      name: u.name,
      email: u.email,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
    };
  }

  async create(data: Partial<User>) {
    const created = new this.userModel(data);
    return created.save();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async updateProfile(id: string, update: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }
}
