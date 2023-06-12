import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { LikeLocation, LikeLocationsType, LikeStatus, LikeStatusType } from '../types/like';

export type LikeDocument = HydratedDocument<Like>;

@Schema()
export class Like {
  constructor(
    userId: string,
    userLogin: string,
    locationName: LikeLocationsType,
    locationId: string,
    myStatus: LikeStatusType,
  ) {
    this.id = randomUUID();
    this.createdAt = new Date();
    this.userId = userId;
    this.userLogin = userLogin;
    this.locationName = locationName;
    this.locationId = locationId;
    this.myStatus = myStatus;
    this.isBanned = false;
  }

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;

  @Prop({ type: String, required: true })
  locationId: string;

  @Prop({ type: String, required: true, enum: LikeLocation })
  locationName: LikeLocationsType;

  @Prop({ type: String, required: true, enum: LikeStatus, default: LikeStatus.None })
  myStatus: LikeStatusType;

  @Prop({ type: Boolean, required: true, default: false })
  isBanned: boolean;

  @Prop({
    type: Date,
    default: () => {
      new Date();
    },
  })
  createdAt: Date;

  public setLikeStatus(likeStatus: LikeStatusType) {
    this.createdAt = new Date();
    this.myStatus = likeStatus;
  }

  public static createInstance(
    userId: string,
    userLogin: string,
    locationName: LikeLocationsType,
    locationId: string,
    myStatus: LikeStatusType,
  ) {
    return new Like(userId, userLogin, locationName, locationId, myStatus);
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.methods = {
  setLikeStatus: Like.prototype.setLikeStatus,
};

LikeSchema.statics = {
  createInstance: Like.createInstance,
};
