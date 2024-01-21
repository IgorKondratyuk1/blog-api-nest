import { Module } from '@nestjs/common';
import { SecurityDevicesService } from './security-devices.service';
import { SecurityDevicesMongoRepository } from './repository/mongoose/security-devices.mongo-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityDevicesController } from './security-devices.controller';
import { SecurityDevice, SecurityDeviceSchema } from './repository/mongoose/schemas/security-device.schema';
import { DbConfigService } from '../../config/config-services/db-config.service';
import { SecurityDevicesRepository } from './interfaces/security-devices.repository';
import { SecurityDevicesPgRepository } from './repository/postgresql/security-devices.pg-repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: SecurityDevice.name, schema: SecurityDeviceSchema }])],
  controllers: [SecurityDevicesController],
  providers: [
    SecurityDevicesService,
    SecurityDevicesMongoRepository,
    SecurityDevicesPgRepository,
    {
      provide: SecurityDevicesRepository,
      useFactory: async (
        dbConfigService: DbConfigService,
        postgresqlSecurityDevicesRepository: SecurityDevicesPgRepository,
        mongooseSecurityDevicesRepository: SecurityDevicesMongoRepository,
      ) => {
        return dbConfigService.dbType === 'sql'
          ? postgresqlSecurityDevicesRepository
          : mongooseSecurityDevicesRepository;
      },
      inject: [DbConfigService, SecurityDevicesPgRepository, SecurityDevicesMongoRepository],
    },
  ],
  exports: [SecurityDevicesRepository, SecurityDevicesService],
})
export class SecurityDevicesModule {}
