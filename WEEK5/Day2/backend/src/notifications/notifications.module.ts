import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { RealtimeModule } from '../realtime/realtime.module';
import { User, UserSchema } from '../auth/user.schema';

@Module({
  imports: [
    RealtimeModule,
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
