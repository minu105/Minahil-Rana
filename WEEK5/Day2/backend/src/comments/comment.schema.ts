import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ required: true, trim: true, maxlength: 1000 })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ default: 0 })
  likesCount: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
(CommentSchema as any).index({ parentId: 1, createdAt: -1 });
