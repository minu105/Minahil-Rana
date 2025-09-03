import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  user: any;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Object })
  payload: any;

  @Prop({ default: false })
  read: boolean;

  // 👇 yeh extra type help karega
  createdAt?: Date;
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
