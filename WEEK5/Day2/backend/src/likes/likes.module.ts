import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './like.schema';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { Comment, CommentSchema } from '../comments/comment.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    NotificationsModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
