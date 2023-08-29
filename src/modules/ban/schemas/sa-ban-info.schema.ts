import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';

export type SuperAdminBanInfoDocument = HydratedDocument<SuperAdminBanInfo>;

@Schema()
export class SuperAdminBanInfo {
  constructor(userId: string, banReason: string) {
    this.id = randomUUID();
    this.createdAt = new Date();
    this.userId = userId;
    this.banReason = banReason;
  }

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  banReason: string;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  public static createInstance(userId: string, banReason: string) {
    return new SuperAdminBanInfo(userId, banReason);
  }
}

export const SuperAdminBanInfoSchema = SchemaFactory.createForClass(SuperAdminBanInfo);

SuperAdminBanInfoSchema.statics = {
  createInstance: SuperAdminBanInfo.createInstance,
};
