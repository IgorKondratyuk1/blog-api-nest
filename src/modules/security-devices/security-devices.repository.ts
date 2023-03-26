import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecurityDevice, SecurityDeviceDocument } from './schemas/device.schema';
import { SecurityConfigService } from '../../config/config-services/security-config.service';
import { CreateSecurityDeviceDto } from './dto/create-security-device.dto';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    private securityConfigService: SecurityConfigService,
    @InjectModel(SecurityDevice.name) private securityDevicesModel: Model<SecurityDeviceDocument>,
  ) {}

  async save(device: SecurityDeviceDocument) {
    await device.save();
  }

  async create(createSecurityDeviceDto: CreateSecurityDeviceDto): Promise<SecurityDevice | null> {
    try {
      const newSecurityDevice: SecurityDevice = SecurityDevice.createInstance(
        createSecurityDeviceDto,
        this.securityConfigService.expiredDeviceSessionDays,
      );

      await this.securityDevicesModel.create(newSecurityDevice);
      return newSecurityDevice;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findDeviceSessionsByUser(userId: string): Promise<SecurityDeviceDocument[] | null> {
    try {
      const devices: SecurityDeviceDocument[] | null = await this.securityDevicesModel.find({
        userId,
      });
      return devices;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findDeviceSession(deviceId: string): Promise<SecurityDeviceDocument | null> {
    try {
      const device: SecurityDeviceDocument | null = await this.securityDevicesModel.findOne({
        deviceId,
      });
      return device;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async deleteOtherSessions(userId: string, currentDeviceId: string): Promise<boolean> {
    try {
      const result = await this.securityDevicesModel.deleteMany({
        userId,
        deviceId: { $ne: currentDeviceId },
      });

      return result.deletedCount > 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteDeviceSession(deviceId: string): Promise<boolean> {
    try {
      const result = await this.securityDevicesModel.deleteOne({ deviceId });
      return result.deletedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteAllSessions() {
    try {
      return await this.securityDevicesModel.deleteMany({});
    } catch (e) {
      console.log(e);
    }
  }
}
