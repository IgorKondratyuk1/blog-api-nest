import { ViewSecurityDeviceDto } from '../dto/view-security-device.dto';
import { SecurityDevice, SecurityDeviceDocument } from '../repository/mongoose/schemas/security-device.schema';
import { SecurityDeviceModel } from '../models/security-device.model';

export class SecurityDeviceMapper {
  public static toView(
    securityDevice: SecurityDevice | SecurityDeviceDocument | SecurityDeviceModel,
  ): ViewSecurityDeviceDto {
    return new ViewSecurityDeviceDto(
      securityDevice.ip,
      securityDevice.title,
      securityDevice.lastActiveDate.toISOString(),
      securityDevice.deviceId,
    );
  }

  public static toMongo(securityDeviceModel: SecurityDeviceModel): SecurityDevice {
    return new SecurityDevice(
      securityDeviceModel.id,
      securityDeviceModel.deviceId,
      securityDeviceModel.userId,
      securityDeviceModel.ip,
      securityDeviceModel.title,
      securityDeviceModel.isValid,
      securityDeviceModel.createdAt,
      securityDeviceModel.lastActiveDate,
    );
  }

  public static toDomainFromDocument(securityDevice: SecurityDevice | SecurityDeviceDocument): SecurityDeviceModel {
    return new SecurityDeviceModel(
      securityDevice.id,
      securityDevice.deviceId,
      securityDevice.userId,
      securityDevice.ip,
      securityDevice.title,
      securityDevice.isValid,
      securityDevice.createdAt,
      securityDevice.lastActiveDate,
    );
  }

  public static toDomainFromSql(
    id: string,
    deviceId: string,
    createdAt: Date,
    userId: string,
    ip: string,
    title: string,
    isValid: boolean,
    lastActiveDate: Date,
  ): SecurityDeviceModel {
    return new SecurityDeviceModel(id, deviceId, userId, ip, title, isValid, createdAt, lastActiveDate);
  }
}
