import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './comment.schema';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module'; // 👈 import instead

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    forwardRef(() => NotificationsModule),
    RealtimeModule, // 👈 just import, don’t re-declare AppGateway
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService, MongooseModule],
})
export class CommentsModule {}
