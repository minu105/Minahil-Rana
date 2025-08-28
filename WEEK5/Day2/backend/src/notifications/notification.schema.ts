import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })  // 👈 auto-manage createdAt & updatedAt
export class Notification {
  @Prop({ required: true, enum: ['comment', 'reply', 'like' , 'follow'] })
  type!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  toUser!: Types.ObjectId;   // 👈 userId → toUser (same as service)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  fromUser!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  comment?: Types.ObjectId;

  @Prop({ default: false })
  read: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
