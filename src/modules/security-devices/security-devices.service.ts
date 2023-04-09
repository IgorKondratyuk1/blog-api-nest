import { HttpStatus, Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from './security-devices.repository';
import { SecurityDevice, SecurityDeviceDocument } from './schemas/device.schema';
import { CreateSecurityDeviceDto } from './dto/create-security-device.dto';
import { CustomErrorDto } from '../../common/dto/error';
import { SecurityDeviceMapper } from './utils/security-device.mapper';
import { ViewSecurityDeviceDto } from './dto/view-security-device.dto';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Injectable()
export class SecurityDevicesService {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async createDeviceSession(createSecurityDeviceDto: CreateSecurityDeviceDto): Promise<SecurityDevice> {
    const newDeviceSession: SecurityDevice | null = await this.securityDevicesRepository.create(
      createSecurityDeviceDto,
    );
    return newDeviceSession;
  }

  async findDeviceSession(deviceId: string): Promise<SecurityDeviceDocument | null> {
    const device: SecurityDeviceDocument | null = await this.securityDevicesRepository.findDeviceSession(deviceId);
    return device;
  }

  async getAllDeviceSessions(userId: string): Promise<ViewSecurityDeviceDto[] | null> {
    const result: SecurityDeviceDocument[] | null = await this.securityDevicesRepository.findDeviceSessionsByUser(
      userId,
    );
    return result.map(SecurityDeviceMapper.toView);
  }

  async deleteOtherSessions(userId: string, currentSessionId: string): Promise<boolean> {
    return await this.securityDevicesRepository.deleteOtherSessions(userId, currentSessionId);
  }

  async deleteAllUserSessions(userId: string): Promise<boolean> {
    return await this.securityDevicesRepository.deleteAllUserSessions(userId);
  }

  async deleteDeviceSession(currentUserId: string, deviceId: string): Promise<boolean | CustomErrorDto> {
    const deviceSession = await this.securityDevicesRepository.findDeviceSession(deviceId);

    if (!deviceSession) {
      return new CustomErrorDto(HttpStatus.NOT_FOUND, 'session is not found');
    }

    if (currentUserId !== deviceSession.userId) {
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not delete session of other user');
    }

    const deleteSession = await this.securityDevicesRepository.deleteDeviceSession(deviceId);
    return deleteSession;
  }
}
