import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { PresenceService } from '../realtime/presence.service';
import { AppGateway } from '../realtime/app.gateway';
import { User } from '../auth/user.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notif: Model<NotificationDocument>,
    private readonly presence: PresenceService,
    @Inject(forwardRef(() => AppGateway)) private gateway: AppGateway,
    @InjectModel(User.name) private users: Model<User>,
  ) {}

  async onNewCommentBroadcast(comment: any, authorId: string) {
    this.gateway.server.emit('comment.created', comment);

    const others = await this.users.find({ _id: { $ne: authorId } }).select('_id').lean();
    const toUsers = others.map(u => u._id.toString());

    // Get author name for better notification message
    const author = await this.users.findById(authorId).select('name').lean();
    const authorName = author?.name || 'Someone';

    const docs = await this.notif.insertMany(
      toUsers.map(uid => ({
        type: 'comment',
        toUser: new Types.ObjectId(uid),
        fromUser: new Types.ObjectId(authorId),
        comment: comment._id,
        message: `${authorName} posted a new comment`,
        read: false,
      })),
      { ordered: false }
    );

    // Emit notifications to all users
    toUsers.forEach(uid => {
      const sockets = this.presence.getUserSockets(uid);
      if (sockets) {
        console.log(`📤 Sending notification to user ${uid} via ${sockets.size} sockets`);
        sockets.forEach(sid => {
          this.gateway.server.to(sid).emit('notification.created', {
            _id: docs.find(d => d.toUser.toString() === uid)?._id,
            type: 'comment',
            toUser: uid,
            fromUser: authorId,
            fromUserName: authorName,
            commentId: comment._id,
            message: `${authorName} posted a new comment`,
            createdAt: new Date(),
            read: false
          });
        });
      } else {
        console.log(`📤 No sockets found for user ${uid}`);
      }
    });
  }

  async onReplyNotifyParent(reply: any, replierId: string) {
    const CommentModel = this.notif.db.model<any>('Comment');

    const parent = await CommentModel.findById(reply.parentId)
      .select('author')
      .lean<{ author: string }>()
      .exec();

    if (!parent) return;

    const toUser = parent.author.toString();
    if (toUser === replierId) return;

    // Get replier name for better notification message
    const replier = await this.users.findById(replierId).select('name').lean();
    const replierName = replier?.name || 'Someone';

    const doc = await this.notif.create({
      type: 'reply',
      toUser,
      fromUser: replierId,
      comment: reply._id,
      message: `${replierName} replied to your comment`,
      read: false,
    });

    // Emit reply event
    const sockets = this.presence.getUserSockets(toUser);
    if (sockets) {
      sockets.forEach(sid => {
        this.gateway.server.to(sid).emit('comment.replied', {
          _id: reply._id,
          content: reply.content,
          parentId: reply.parentId,
          author: reply.author,
          createdAt: reply.createdAt,
          likesCount: reply.likesCount,
        });

        this.gateway.server.to(sid).emit('notification.created', {
          _id: doc._id,
          type: 'reply',
          toUser,
          fromUser: replierId,
          fromUserName: replierName,
          commentId: reply._id,
          message: `${replierName} replied to your comment`,
          createdAt: doc.createdAt,
          read: false
        });
      });
    }
  }

  async onLikeNotifyAuthor(commentId: string, likerId: string, authorId: string) {
    if (authorId === likerId) return;

    // Get liker name for better notification message
    const liker = await this.users.findById(likerId).select('name').lean();
    const likerName = liker?.name || 'Someone';

    const doc = await this.notif.create({
      type: 'like',
      toUser: new Types.ObjectId(authorId),
      fromUser: new Types.ObjectId(likerId),
      comment: new Types.ObjectId(commentId),
      message: `${likerName} liked your comment`,
      read: false,
    });

    // Emit like event and notification
    const sockets = this.presence.getUserSockets(authorId);
    if (sockets) {
      sockets.forEach(sid => {
        this.gateway.server.to(sid).emit('comment.liked', { commentId, by: likerId });
        this.gateway.server.to(sid).emit('notification.created', {
          _id: doc._id,
          type: 'like',
          toUser: authorId,
          fromUser: likerId,
          fromUserName: likerName,
          commentId,
          message: `${likerName} liked your comment`,
          createdAt: doc.createdAt,
          read: false
        });
      });
    }
  }

  async onFollowNotify(followerId: string, followedId: string) {
    if (followerId === followedId) return;

    // Get follower name for better notification message
    const follower = await this.users.findById(followerId).select('name').lean();
    const followerName = follower?.name || 'Someone';

    const doc = await this.notif.create({
      type: 'follow',
      toUser: new Types.ObjectId(followedId),
      fromUser: new Types.ObjectId(followerId),
      message: `${followerName} started following you`,
      read: false,
    });

    // Emit follow event and notification
    const sockets = this.presence.getUserSockets(followedId);
    if (sockets) {
      sockets.forEach(sid => {
        this.gateway.server.to(sid).emit('user.followed', {
          fromUser: followerId,
          fromUserName: followerName,
        });

        this.gateway.server.to(sid).emit('notification.created', {
          _id: doc._id,
          type: 'follow',
          toUser: followedId,
          fromUser: followerId,
          fromUserName: followerName,
          message: `${followerName} started following you`,
          createdAt: doc.createdAt,
          read: false
        });
      });
    }
  }

  listForUser(userId: string) {
    console.log('📋 Listing notifications for user:', userId);
    return this.notif.find({ toUser: new Types.ObjectId(userId) })
      .populate('fromUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .then((notifications) => {
        console.log('📋 Found notifications in database:', notifications.length);
        console.log('📋 Sample notifications:', notifications.slice(0, 2));
        return notifications;
      });
  }

  markRead(userId: string, id: string) {
    return this.notif.updateOne(
      { _id: id, toUser: new Types.ObjectId(userId) },
      { $set: { read: true } }
    );
  }

  markAllRead(userId: string) {
    return this.notif.updateMany(
      { toUser: new Types.ObjectId(userId), read: false },
      { $set: { read: true } }
    );
  }
}
