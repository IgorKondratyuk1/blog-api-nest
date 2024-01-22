import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecurityDevicesRepository } from '../../interfaces/security-devices.repository';
import { SecurityDevice, SecurityDeviceDocument } from './schemas/security-device.schema';
import { SecurityDeviceModel } from '../../models/security-device.model';
import { SecurityDeviceMapper } from '../../utils/security-device.mapper';

@Injectable()
export class SecurityDevicesMongoRepository extends SecurityDevicesRepository {
  constructor(@InjectModel(SecurityDevice.name) private securityDeviceModel: Model<SecurityDeviceDocument>) {
    super();
  }

  async save(securityDevice: SecurityDeviceModel): Promise<boolean> {
    try {
      const savingSecurityDevice = new this.securityDeviceModel(SecurityDeviceMapper.toMongo(securityDevice));
      const result = await this.securityDeviceModel.findByIdAndUpdate(securityDevice.id, savingSecurityDevice);
      return !!result;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(securityDeviceModel: SecurityDeviceModel): Promise<SecurityDeviceModel | null> {
    try {
      const newSecurityDevice = new this.securityDeviceModel(SecurityDeviceMapper.toMongo(securityDeviceModel));
      const createdSecurityDevice = await this.securityDeviceModel.create(newSecurityDevice);
      return SecurityDeviceMapper.toDomainFromDocument(createdSecurityDevice);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findDeviceSessionsByUserId(userId: string): Promise<SecurityDeviceModel[] | null> {
    try {
      const deviceDocuments: SecurityDeviceDocument[] | null = await this.securityDeviceModel.find({
        userId,
      });
      return deviceDocuments.map(SecurityDeviceMapper.toDomainFromDocument);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findDeviceSessionByDeviceId(deviceId: string): Promise<SecurityDeviceModel | null> {
    try {
      const deviceDocument: SecurityDeviceDocument | null = await this.securityDeviceModel.findOne({
        deviceId,
      });
      return SecurityDeviceMapper.toDomainFromDocument(deviceDocument);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async deleteOtherSessionsExceptCurrent(userId: string, currentDeviceId: string): Promise<boolean> {
    try {
      const result = await this.securityDeviceModel.deleteMany({
        userId,
        deviceId: { $ne: currentDeviceId },
      });

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteAllUserSessions(userId: string): Promise<boolean> {
    try {
      const result = await this.securityDeviceModel.deleteMany({
        userId,
      });

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteDeviceSessionByDeviceId(deviceId: string): Promise<boolean> {
    try {
      const result = await this.securityDeviceModel.deleteOne({ deviceId });
      return result.deletedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteAllSessions(): Promise<boolean> {
    try {
      await this.securityDeviceModel.deleteMany({});
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
