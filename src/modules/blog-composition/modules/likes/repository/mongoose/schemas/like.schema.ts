import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeLocation, LikeLocationsType, LikeStatus, LikeStatusType } from '../../../types/like';

@Schema()
export class LikeMongoEntity {
  constructor(
    id: string,
    userId: string,
    userLogin: string,
    locationId: string,
    locationName: LikeLocationsType,
    myStatus: LikeStatusType,
    isBanned: boolean,
    createdAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.userLogin = userLogin;
    this.locationName = locationName;
    this.locationId = locationId;
    this.myStatus = myStatus;
    this.isBanned = isBanned;
    this.createdAt = createdAt;
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
}

export type LikeDocument = HydratedDocument<LikeMongoEntity>;
export const LikeSchema = SchemaFactory.createForClass(LikeMongoEntity);
