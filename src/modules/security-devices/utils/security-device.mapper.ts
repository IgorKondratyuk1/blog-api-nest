import { ViewSecurityDeviceDto } from '../dto/view-security-device.dto';
import { SecurityDevice, SecurityDeviceDocument } from '../schemas/device.schema';

export class SecurityDeviceMapper {
  public static toView(
    securityDevice: SecurityDevice | SecurityDeviceDocument,
  ): ViewSecurityDeviceDto {
    return new ViewSecurityDeviceDto(
      securityDevice.ip,
      securityDevice.title,
      securityDevice.lastActiveDate.toISOString(),
      securityDevice.deviceId,
    );
  }
}
