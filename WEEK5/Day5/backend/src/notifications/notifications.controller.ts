import { BadRequestException, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: any, @Query() query: any) { 
    const { page = 1, limit = 20, unreadOnly } = query;
    const p = Number(page);
    const l = Number(limit);
    const safePage = Number.isFinite(p) && p > 0 ? p : 1;
    const safeLimit = Number.isFinite(l) && l > 0 && l <= 100 ? l : 20;
    return this.notifications.list(user._id, { page: safePage, limit: safeLimit, unreadOnly: unreadOnly === 'true' }); 
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: any) {
    return this.notifications.getUnreadCount(user._id);
  }

  @Patch(':id/read')
  read(@CurrentUser() user: any, @Param('id') id: string) {
    // Validate ID to avoid CastError -> 500
    const isValid = /^[a-fA-F0-9]{24}$/.test(id);
    if (!isValid) throw new BadRequestException('Invalid notification id');
    return this.notifications.markRead(user._id, id);
  }

  @Post('mark-all-read')
  markAllRead(@CurrentUser() user: any) {
    return this.notifications.markAllRead(user._id);
  }
}
