/* eslint-disable prettier/prettier */

import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User extends Document {
  @Prop({ unique: true, index: true })
  name: string;

  
}

export const UsersSchema = SchemaFactory.createForClass(User);
