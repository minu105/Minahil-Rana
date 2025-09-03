import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto, role: UserRole = UserRole.CUSTOMER): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = new this.userModel({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role,
      firstPurchaseEligible: true,
    });
    return created.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async setFirstPurchaseEligible(userId: string, eligible: boolean): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $set: { firstPurchaseEligible: eligible } }).exec();
  }

  async adjustLoyaltyPoints(userId: string, delta: number): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $inc: { loyaltyPoints: delta } }).exec();
  }

  async setRole(userId: string, role: UserRole): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $set: { role } }).exec();
  }
}
