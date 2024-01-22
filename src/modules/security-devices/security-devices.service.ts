import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateSecurityDeviceDto } from './dto/create-security-device.dto';
import { CustomErrorDto } from '../../common/dto/error';
import { SkipThrottle } from '@nestjs/throttler';
import { SecurityDeviceModel } from './models/security-device.model';
import { SecurityDevicesRepository } from './interfaces/security-devices.repository';
import { SecurityConfigService } from '../../config/config-services/security-config.service';

@SkipThrottle()
@Injectable()
export class SecurityDevicesService {
  constructor(
    private securityDevicesRepository: SecurityDevicesRepository,
    private securityConfigService: SecurityConfigService,
  ) {}

  async createDeviceSession(createSecurityDeviceDto: CreateSecurityDeviceDto): Promise<SecurityDeviceModel> {
    const newDeviceSession: SecurityDeviceModel = SecurityDeviceModel.createInstance(
      createSecurityDeviceDto,
      this.securityConfigService.expiredDeviceSessionDays,
    );

    const createdDeviceSession: SecurityDeviceModel | null = await this.securityDevicesRepository.create(
      newDeviceSession,
    );

    return createdDeviceSession;
  }

  async findDeviceSessionByDeviceId(deviceId: string): Promise<SecurityDeviceModel | null> {
    const device: SecurityDeviceModel | null = await this.securityDevicesRepository.findDeviceSessionByDeviceId(
      deviceId,
    );
    return device;
  }

  async getAllDeviceSessions(userId: string): Promise<SecurityDeviceModel[] | null> {
    const result: SecurityDeviceModel[] | null = await this.securityDevicesRepository.findDeviceSessionsByUserId(
      userId,
    );
    return result;
  }

  async deleteOtherSessions(userId: string, currentSessionId: string): Promise<boolean> {
    return await this.securityDevicesRepository.deleteOtherSessionsExceptCurrent(userId, currentSessionId);
  }

  async deleteAllUserSessions(userId: string): Promise<boolean> {
    return await this.securityDevicesRepository.deleteAllUserSessions(userId);
  }

  async deleteDeviceSession(currentUserId: string, deviceId: string): Promise<boolean | CustomErrorDto> {
    const deviceSession = await this.securityDevicesRepository.findDeviceSessionByDeviceId(deviceId);

    if (!deviceSession) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'session is not found');
    }

    if (currentUserId !== deviceSession.userId) {
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not delete session of other user');
    }

    const deleteSession = await this.securityDevicesRepository.deleteDeviceSessionByDeviceId(deviceId);
    return deleteSession;
  }
}
