import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifs: NotificationsService) {}

  @Get()
  async list(@CurrentUser() me: any) { 
    console.log('📋 Fetching notifications for user:', me.id);
    const notifications = await this.notifs.listForUser(me.id);
    console.log('📋 Found notifications:', notifications.length);
    console.log('📋 First few notifications:', notifications.slice(0, 3));
    return notifications;
  }

  @Patch(':id/read')
  read(@Param('id') id: string, @CurrentUser() me: any) { return this.notifs.markRead(me.id, id); }

  @Patch('read-all')
  readAll(@CurrentUser() me: any) { return this.notifs.markAllRead(me.id); }
}
