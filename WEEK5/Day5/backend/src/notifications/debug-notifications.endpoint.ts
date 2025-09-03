import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { NotificationsService } from './notifications.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';

@Controller('api/debug')
@UseGuards(JwtAuthGuard)
export class DebugNotificationsController {
  constructor(
    private notifications: NotificationsService,
    @InjectModel(Notification.name) private model: Model<NotificationDocument>
  ) {}

  @Get('notifications')
  async debugNotifications(@CurrentUser() user: any) {
    console.log('Debug: Current user:', user);
    
    // Get all notifications for this user
    const allNotifications = await this.model.find({ user: user._id }).sort({ createdAt: -1 }).lean();
    console.log('Debug: All notifications for user:', allNotifications);
    
    // Get unread count
    const unreadCount = await this.model.countDocuments({ user: user._id, read: false });
    console.log('Debug: Unread count:', unreadCount);
    
    return {
      userId: user._id,
      userEmail: user.email,
      totalNotifications: allNotifications.length,
      unreadCount,
      notifications: allNotifications
    };
  }

  @Get('notifications/all')
  async getAllNotifications() {
    const allNotifications = await this.model.find({}).sort({ createdAt: -1 }).lean();
    console.log('Debug: All notifications in database:', allNotifications.length);
    
    return {
      total: allNotifications.length,
      notifications: allNotifications
    };
  }
}
