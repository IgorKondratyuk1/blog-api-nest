import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeLocation, LikeLocationsType, LikeStatusType } from '../../blog-composition/modules/likes/types/like';
import { BanLocation, BanLocationType } from '../types/ban-locations';
import { HydratedDocument } from 'mongoose';
import { Like, LikeSchema } from '../../blog-composition/modules/likes/schemas/like.schema';
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
