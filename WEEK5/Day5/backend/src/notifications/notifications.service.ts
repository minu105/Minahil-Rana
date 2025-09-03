import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { RealtimeGateway } from '../realtime/socket.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private model: Model<NotificationDocument>,
    private gateway: RealtimeGateway
  ) {}

  async createAndEmit(userId: any, type: string, payload: any) {
    try {
      const doc = await this.model.create({
        user: new Types.ObjectId(userId),
        type,
        payload,
        read: false
      });

      const plain = doc.toObject();
      console.log(`Created notification in DB:`, plain);

      console.log(`Emitting notification to user:${userId}`, { type, payload });
      this.gateway.emitToRoom(`user:${userId}`, 'notification', {
        _id: plain._id,
        type,
        payload,
        createdAt: plain.createdAt,
        read: plain.read
      });

      return plain;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async list(userId: any, options: any = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const query: any = { user: new Types.ObjectId(userId) };
    if (unreadOnly) query.read = false;
    
    console.log(`Fetching notifications for user ${userId} with query:`, query);
    
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(query)
    ]);
    
    console.log(`Found ${items.length} notifications for user ${userId}, total: ${total}`);
    
    return { items, total, page, limit };
  }

  async getUnreadCount(userId: any) {
    const count = await this.model.countDocuments({ user: new Types.ObjectId(userId), read: false });
    console.log(`Unread count for user ${userId}:`, count);
    return { count };
  }

  markRead(userId: any, id: string) {
    return this.model
      .findOneAndUpdate({ _id: id, user: new Types.ObjectId(userId) }, { read: true }, { new: true })
      .lean();
  }

  async markAllRead(userId: any) {
    console.log(`Marking all notifications as read for user: ${userId}`);
    const result = await this.model.updateMany(
      { user: new Types.ObjectId(userId), read: false }, 
      { read: true }
    );
    console.log(`Marked ${result.modifiedCount} notifications as read`);
    return { modifiedCount: result.modifiedCount };
  }
}
