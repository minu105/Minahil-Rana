import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from './like.schema';
import { Comment } from '../comments/comment.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name) private likes: Model<Like>,
    @InjectModel(Comment.name) private comments: Model<Comment>,
    private readonly notifications: NotificationsService,
  ) {}

  async like(commentId: string, userId: string) {
    await this.likes.create({ user: userId, comment: commentId });
    await this.comments.updateOne({ _id: commentId }, { $inc: { likesCount: 1 } });
    const c = await this.comments.findById(commentId).select('author');
    if (c && c.author.toString() !== userId) {
      await this.notifications.onLikeNotifyAuthor(commentId, userId, c.author.toString());
    }
  }

  async unlike(commentId: string, userId: string) {
    const res = await this.likes.deleteOne({ user: userId, comment: commentId });
    if (res.deletedCount) {
      await this.comments.updateOne({ _id: commentId }, { $inc: { likesCount: -1 } });
    }
  }
}
