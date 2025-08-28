import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './comment.schema';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private model: Model<Comment>) {}

  async create({ content, authorId, parentId }:
    { content: string; authorId: string; parentId: string | null; }) {
    const doc = await this.model.create({ content, author: authorId, parentId: parentId || null });
    return this.model.findById(doc._id).populate('author', 'name email avatarUrl').lean();
  }

  async listTop() {
    return this.model.find({ parentId: null })
      .populate('author', 'name email avatarUrl')
      .sort({ createdAt: -1 }).limit(100).lean();
  }

  async listReplies(parentId: string) {
    return this.model.find({ parentId })
      .populate('author', 'name email avatarUrl')
      .sort({ createdAt: 1 }).limit(200).lean();
  }

  async getAuthorId(commentId: string): Promise<string> {
    const c = await this.model.findById(commentId).select('author');
    if (!c) throw new NotFoundException('Comment not found');
    return c.author.toString();
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.model.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.model.deleteMany({
      $or: [
        { _id: commentId },
        { parentId: commentId }
      ]
    });
  }

  // ✨ New: Update Comment (only author can update)
  async update(commentId: string, content: string, userId: string) {
    const comment = await this.model.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = content;
    await comment.save();

    return this.model.findById(comment._id).populate('author', 'name email avatarUrl').lean();
  }
}
