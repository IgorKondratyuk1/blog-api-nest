import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SecurityDevicesService } from './security-devices.service';
import { JwtRefreshAuthGuard } from '../auth/guards/jwt-refresh-auth.guard';
import { CurrentTokenPayload } from '../auth/decorators/current-token-payload.param.decorator';
import { AuthTokenPayloadDto } from '../auth/dto/auth-token-payload.dto';
import { ViewSecurityDeviceDto } from './dto/view-security-device.dto';
import { CustomErrorDto } from '../../common/dto/error';
import { SecurityDeviceMapper } from './utils/security-device.mapper';
import { SecurityDeviceModel } from './models/security-device.model';

@SkipThrottle()
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(private readonly securityDevicesService: SecurityDevicesService) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Get()
  async findAll(@CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto) {
    const result: SecurityDeviceModel[] | null = await this.securityDevicesService.getAllDeviceSessions(
      tokenPayload.userId,
    );

    if (!result) throw new NotFoundException('device sessions is not found');
    return result.map(SecurityDeviceMapper.toView);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async removeAllExceptCurrent(@CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto) {
    const result: boolean = await this.securityDevicesService.deleteOtherSessions(
      tokenPayload.userId,
      tokenPayload.deviceId,
    );
    if (!result) throw new InternalServerErrorException('can not delete session');
    return;
  }

  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async removeById(@Param('id') id: string, @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto) {
    const result: boolean | CustomErrorDto = await this.securityDevicesService.deleteDeviceSession(
      tokenPayload.userId,
      id,
    );
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new InternalServerErrorException('can not delete session');
    return;
  }
}
