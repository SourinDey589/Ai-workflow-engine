import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RequestDocument = HydratedDocument<Request>;

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: ['billing', 'support', 'feedback', 'general'], default: null })
  category: string;

  @Prop({ type: String, default: null })
  summary: string;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: null })
  urgency: string;
}

export const RequestSchema = SchemaFactory.createForClass(Request);