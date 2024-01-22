import { SecurityDeviceModel } from '../models/security-device.model';

export abstract class SecurityDevicesRepository {
  public abstract save(device: SecurityDeviceModel): Promise<boolean>;

  public abstract create(securityDeviceModel: SecurityDeviceModel): Promise<SecurityDeviceModel | null>;

  public abstract findDeviceSessionsByUserId(userId: string): Promise<SecurityDeviceModel[] | null>;

  public abstract findDeviceSessionByDeviceId(deviceId: string): Promise<SecurityDeviceModel | null>;

  public abstract deleteOtherSessionsExceptCurrent(userId: string, currentDeviceId: string): Promise<boolean>;

  public abstract deleteAllUserSessions(userId: string): Promise<boolean>;

  public abstract deleteDeviceSessionByDeviceId(deviceId: string): Promise<boolean>;

  public abstract deleteAllSessions(): Promise<boolean>;
}
