import { add } from 'date-fns';
import { CreateSecurityDeviceDto } from '../dto/create-security-device.dto';
import IdGenerator from '../../../common/utils/id-generator';

export class SecurityDeviceModel {
  public id: string;
  public deviceId: string;
  public userId: string;
  public ip: string;
  public title: string;
  public isValid: boolean;
  public createdAt: Date;
  public lastActiveDate: Date;

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
    this.id = id;
    this.deviceId = deviceId;
    this.userId = userId;
    this.ip = ip;
    this.title = title;
    this.isValid = isValid;
    this.createdAt = createdAt;
    this.lastActiveDate = lastActiveDate;
  }

  public setLastActiveDate(lastActiveDate: Date) {
    this.lastActiveDate = lastActiveDate;
  }

  private static calculateLastActiveDate(createdAt: Date, expiredDeviceSessionDays: number): Date {
    return add(createdAt, { days: expiredDeviceSessionDays });
  }

  public static createInstance(createBlogDto: CreateSecurityDeviceDto, expiredDeviceSessionDays: number) {
    const createdAt = new Date();
    const lastActiveDate = this.calculateLastActiveDate(createdAt, expiredDeviceSessionDays);

    return new SecurityDeviceModel(
      IdGenerator.generate(),
      IdGenerator.generate(),
      createBlogDto.userId,
      createBlogDto.ip,
      createBlogDto.title,
      true,
      createdAt,
      lastActiveDate,
    );
  }
}
