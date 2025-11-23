import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  [x: string]: any;
  @Prop({ required: true, unique: true, index: true })
  email: string;

  // Use select: false to exclude the password hash by default
  @Prop({ required: true, select: false }) 
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  id: string;
}

export const UserSchema = SchemaFactory.createForClass(User);