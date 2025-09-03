import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CarDocument = HydratedDocument<Car>;

@Schema({ timestamps: true })
export class Car {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) owner: any;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) make: string;
  @Prop({ required: true }) model: string;
  @Prop({ required: true }) year: number;
  @Prop({ required: true }) bodyType: string;
  @Prop() mileage?: number;
  @Prop() engineSize?: string;
  @Prop() paintStatus?: string;
  @Prop() hasGccSpecs?: boolean;
  @Prop() accidentHistory?: string;
  @Prop() fullServiceHistory?: boolean;
  @Prop() description?: string;
  @Prop({ type: [String], default: [] }) photos: string[];
}

export const CarSchema = SchemaFactory.createForClass(Car);
