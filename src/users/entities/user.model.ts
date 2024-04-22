import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: false, unique: true, sparse: true }) // Añade unique: true y sparse: true
  email: string;

  @Prop({ required: false, unique: true, sparse: true }) // Añade unique: true y sparse: true
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  lastname: string;

  @Prop({
    type: String,
  })
  code: string;

  @Prop({
    type: Date,
  })
  codeExpires: Date;

  @Prop({
    type: String,
  })
  recoveryCode: string;

  @Prop({
    type: Date,
  })
  recoveryCodeExpires: Date;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UsersSchema = SchemaFactory.createForClass(User);
