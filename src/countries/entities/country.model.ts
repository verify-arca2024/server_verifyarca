import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Country extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  isoCode: string;

  @Prop()
  flagImageUrl: string;

  @Prop()
  phoneCode: string;
}

export const CountriesSchema = SchemaFactory.createForClass(Country);
