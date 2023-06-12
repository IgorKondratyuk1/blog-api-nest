import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { CreateSecurityDeviceDto } from '../dto/create-security-device.dto';
import { add } from 'date-fns';

export type SecurityDeviceDocument = HydratedDocument<SecurityDevice>;

@Schema()
export class SecurityDevice {
  constructor(userId: string, ip: string, title: string, expiredDeviceSessionDays: number) {
    this.id = randomUUID();
    this.deviceId = randomUUID();
    this.createdAt = new Date();
    this.userId = userId;
    this.ip = ip;
    this.title = title;
    this.isValid = true;
    this.lastActiveDate = add(this.createdAt, { days: expiredDeviceSessionDays });
  }

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

  public setLastActiveDate(lastActiveDate: Date) {
    this.lastActiveDate = lastActiveDate;
  }

  public static createInstance(createBlogDto: CreateSecurityDeviceDto, expiredDeviceSessionDays: number) {
    return new SecurityDevice(createBlogDto.userId, createBlogDto.ip, createBlogDto.title, expiredDeviceSessionDays);
  }
}

export const SecurityDeviceSchema = SchemaFactory.createForClass(SecurityDevice);

SecurityDeviceSchema.methods = {
  setLastActiveDate: SecurityDevice.prototype.setLastActiveDate,
};

SecurityDeviceSchema.statics = {
  createInstance: SecurityDevice.createInstance,
};
