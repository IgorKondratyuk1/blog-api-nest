import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SecurityDeviceDocument = HydratedDocument<SecurityDevice>;

@Schema()
export class SecurityDevice {
  constructor(
    id: string,
    deviceId: string,
    userId: string,
    ip: string,
    title: string,
    isValid: boolean,
    createdAt: Date,
    lastActiveDate: Date,
  ) {
    this._id = id;
    this.id = id;
    this.deviceId = deviceId;
    this.createdAt = createdAt;
    this.userId = userId;
    this.ip = ip;
    this.title = title;
    this.isValid = isValid;
    this.lastActiveDate = lastActiveDate; //add(this.createdAt, { days: expiredDeviceSessionDays });
  }

  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String })
  ip: string;

  @Prop({ type: Boolean })
  isValid: boolean;

  @Prop({
    type: Date,
    default: () => {
      new Date();
    },
  })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  // public setLastActiveDate(lastActiveDate: Date) {
  //   this.lastActiveDate = lastActiveDate;
  // }
  //
  // public static createInstance(createBlogDto: CreateSecurityDeviceDto, expiredDeviceSessionDays: number) {
  //   return new SecurityDevice(createBlogDto.userId, createBlogDto.ip, createBlogDto.title, expiredDeviceSessionDays);
  // }
}

export const SecurityDeviceSchema = SchemaFactory.createForClass(SecurityDevice);

// SecurityDeviceSchema.methods = {
//   setLastActiveDate: SecurityDevice.prototype.setLastActiveDate,
// };
//
// SecurityDeviceSchema.statics = {
//   createInstance: SecurityDevice.createInstance,
// };
