import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersActions } from './schemas/users-actions.schema';
import { SecurityConfigService } from '../../config/config-services/security-config.service';
import { CreateUsersActionsDto } from './dto/create-users-actions.dto';

@Injectable()
export class UsersActionsRepository {
  constructor(
    @InjectModel(UsersActions.name) private usersActionsModel: Model<UsersActions>,
    private securityConfigService: SecurityConfigService,
  ) {}

  async create(createUsersActionsDto: CreateUsersActionsDto): Promise<UsersActions | null> {
    try {
      const newUsersAction: UsersActions = await UsersActions.createInstance(createUsersActionsDto);
      await this.usersActionsModel.create(newUsersAction);
      return newUsersAction;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getUserActionsCount(ip: string, resource: string): Promise<number | null> {
    try {
      const count: number = await this.usersActionsModel.countDocuments({ ip, resource });
      return count;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async deleteAllActions() {
    try {
      return this.usersActionsModel.deleteMany({});
    } catch (e) {
      console.log(e);
    }
  }

  async deleteExpiredActions() {
    try {
      const deleteDate: Date = new Date(Date.now() - this.securityConfigService.debounceTimeMs);
      return this.usersActionsModel.deleteMany({ createdAt: { $lte: deleteDate } });
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
