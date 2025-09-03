import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  name: string; // slug: casual, formal, gym, party

  @Prop({ required: true })
  displayName: string; // Casual, Formal, Gym, Party
}

export const CategorySchema = SchemaFactory.createForClass(Category);
