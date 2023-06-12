import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Account {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, unique: true })
  passwordHash: string;

  @Prop({
    type: Date,
    default: () => {
      new Date();
    },
  })
  createdAt: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
