import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TestNotificationController } from './test-notification.endpoint';
import { DebugNotificationsController } from './debug-notifications.endpoint';
import { Notification, NotificationSchema } from './notification.schema';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule, MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])],
  providers: [NotificationsService],
  controllers: [NotificationsController, TestNotificationController, DebugNotificationsController],
  exports: [NotificationsService]
})
export class NotificationsModule {}
