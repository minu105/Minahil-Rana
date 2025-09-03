import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  create(data: Partial<User>) { return this.model.create(data); }
  findByEmail(email: string) { return this.model.findOne({ email }).lean(); }
  findByUsername(username: string) { return this.model.findOne({ username }).lean(); }
  findById(id: any) { return this.model.findById(id).lean(); }
  updateMe(id: any, patch: Partial<User>) { return this.model.findByIdAndUpdate(id, patch, { new: true }).lean(); }
}
