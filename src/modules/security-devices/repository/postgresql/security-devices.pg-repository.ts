import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SecurityDevicesRepository } from '../../interfaces/security-devices.repository';
import { SecurityDeviceModel } from '../../models/security-device.model';
import { SecurityDeviceMapper } from '../../utils/security-device.mapper';
import { dbSecurityDevice } from './types/security-devices';

@Injectable()
export class SecurityDevicesPgRepository extends SecurityDevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  async save(securityDevice: SecurityDeviceModel): Promise<boolean> {
    try {
      const updateDeviceQuery =
        'UPDATE public."security" SET ' +
        'title=$1, device_id=$2, ip=$3, is_valid=$4, created_at=$5, last_active_date=$6, user_id=$7 ' +
        'WHERE id=$8';

      const resultUpdateDeviceQuery = await this.dataSource.query(updateDeviceQuery, [
        securityDevice.title,
        securityDevice.deviceId,
        securityDevice.ip,
        securityDevice.isValid,
        securityDevice.createdAt,
        securityDevice.lastActiveDate,
        securityDevice.userId,
        securityDevice.id,
      ]);

      console.log('SecurityDevicesMongoRepository - Save: resultUpdateDeviceQuery');
      console.log(resultUpdateDeviceQuery);

      return resultUpdateDeviceQuery[1] >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(securityDeviceModel: SecurityDeviceModel): Promise<SecurityDeviceModel | null> {
    try {
      const securityDeviceInsertQuery = `INSERT INTO public.security(id, device_id, title, ip, is_valid, created_at, last_active_date, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;
      const result = await this.dataSource.query(securityDeviceInsertQuery, [
        securityDeviceModel.id,
        securityDeviceModel.deviceId,
        securityDeviceModel.title,
        securityDeviceModel.ip,
        securityDeviceModel.isValid,
        securityDeviceModel.createdAt,
        securityDeviceModel.lastActiveDate,
        securityDeviceModel.userId,
      ]);

      const createdSecurityDevice: SecurityDeviceModel | null = await this.findDeviceSessionById(
        securityDeviceModel.id,
      );
      console.log('createdSecurityDevice');
      console.log(createdSecurityDevice);
      return createdSecurityDevice;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findDeviceSessionById(id: string): Promise<SecurityDeviceModel | null> {
    try {
      const findQuery =
        'SELECT title as "title", device_id as "deviceId", ip, is_valid as "isValid", created_at as "createdAt", last_active_date as "lastActiveDate", user_id as "userId", id as "id" ' +
        'FROM public.security t WHERE t.id = $1;';

      const result: dbSecurityDevice[] = await this.dataSource.query(findQuery, [id]);

      if (result.length === 0) return null;
      const dbSecurityDevice = result[0];

      return SecurityDeviceMapper.toDomainFromSql(
        dbSecurityDevice.id,
        dbSecurityDevice.deviceId,
        dbSecurityDevice.createdAt,
        dbSecurityDevice.userId,
        dbSecurityDevice.ip,
        dbSecurityDevice.title,
        dbSecurityDevice.isValid,
        dbSecurityDevice.lastActiveDate,
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findDeviceSessionByDeviceId(deviceId: string): Promise<SecurityDeviceModel | null> {
    try {
      const findQuery =
        'SELECT title as "title", device_id as "deviceId", ip, is_valid as "isValid", created_at as "createdAt", last_active_date as "lastActiveDate", user_id as "userId", id as "id" ' +
        'FROM public.security t WHERE t.device_id = $1;';

      const result: dbSecurityDevice[] = await this.dataSource.query(findQuery, [deviceId]);
      if (result.length === 0) return null;

      const dbSecurityDevice = result[0];

      console.log('findDeviceSessionById dbSecurityDevice');
      console.log(dbSecurityDevice);

      return SecurityDeviceMapper.toDomainFromSql(
        dbSecurityDevice.id,
        dbSecurityDevice.deviceId,
        dbSecurityDevice.createdAt,
        dbSecurityDevice.userId,
        dbSecurityDevice.ip,
        dbSecurityDevice.title,
        dbSecurityDevice.isValid,
        dbSecurityDevice.lastActiveDate,
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findDeviceSessionsByUserId(userId: string): Promise<SecurityDeviceModel[] | null> {
    try {
      const findQuery =
        'SELECT title as "title", device_id as "deviceId", ip, is_valid as "isValid", created_at as "createdAt", last_active_date as "lastActiveDate", user_id as "userId", id as "id" ' +
        'FROM public.security t WHERE t.user_id = $1;';

      const result: dbSecurityDevice[] = await this.dataSource.query(findQuery, [userId]);
      if (result.length === 0) return null;

      console.log('findDeviceSessionsByUserId dbSecurityDevices');
      console.log(result);

      return result.map((dbSecurityDevice) =>
        SecurityDeviceMapper.toDomainFromSql(
          dbSecurityDevice.id,
          dbSecurityDevice.deviceId,
          dbSecurityDevice.createdAt,
          dbSecurityDevice.userId,
          dbSecurityDevice.ip,
          dbSecurityDevice.title,
          dbSecurityDevice.isValid,
          dbSecurityDevice.lastActiveDate,
        ),
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async deleteOtherSessionsExceptCurrent(userId: string, currentDeviceId: string): Promise<boolean> {
    try {
      const deleteQuery = 'DELETE FROM public.security t WHERE t.user_id = $1 AND t.device_id != $2;';
      const result = await this.dataSource.query(deleteQuery, [userId, currentDeviceId]);

      console.log('deleteOtherSessionsExceptCurrent result');
      console.log(result);

      return true; // TODO result[1] >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteAllUserSessions(userId: string): Promise<boolean> {
    try {
      const deleteQuery = 'DELETE FROM public.security t WHERE t.user_id = $1;';
      const result = await this.dataSource.query(deleteQuery, [userId]);

      console.log('deleteAllUserSessions result');
      console.log(result);

      return true; // TODO result[1] >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteDeviceSessionByDeviceId(deviceId: string): Promise<boolean> {
    try {
      const deleteQuery = 'DELETE FROM public.security t WHERE t.device_id = $1;';
      const result = await this.dataSource.query(deleteQuery, [deviceId]);

      console.log('deleteDeviceSession result');
      console.log(result);

      return true; // TODO result[1] >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async deleteAllSessions(): Promise<boolean> {
    try {
      const deleteQuery = 'DELETE FROM public.security;';
      const result = await this.dataSource.query(deleteQuery);

      return true; // TODO result[1] >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
