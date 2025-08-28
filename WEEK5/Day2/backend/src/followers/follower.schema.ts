import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Follower {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  follower: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  followee: Types.ObjectId;
}

export type FollowerDocument = Follower & Document;
export const FollowerSchema = SchemaFactory.createForClass(Follower);
