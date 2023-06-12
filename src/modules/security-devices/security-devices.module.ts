import { Module } from '@nestjs/common';
import { SecurityDevicesService } from './security-devices.service';
import { SecurityDevicesRepository } from './security-devices.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityDevice, SecurityDeviceSchema } from './schemas/device.schema';
import { SecurityDevicesController } from './security-devices.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: SecurityDevice.name, schema: SecurityDeviceSchema }])],
  controllers: [SecurityDevicesController],
  providers: [SecurityDevicesRepository, SecurityDevicesService],
  exports: [SecurityDevicesRepository, SecurityDevicesService],
})
export class SecurityDevicesModule {}
