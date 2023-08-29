import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Account {
  constructor(login: string, email: string, passwordHash: string, createdAt: Date) {
    this.login = login;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
  }

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
