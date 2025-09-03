import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('api/test')
@UseGuards(JwtAuthGuard)
export class TestNotificationController {
  constructor(private notifications: NotificationsService) {}

  @Post('notification')
  async testNotification(@CurrentUser() user: any, @Body() body: any) {
    const { type = 'test', message = 'Test notification' } = body;
    
    await this.notifications.createAndEmit(user._id, type, {
      message,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'Test notification sent' };
  }
}
