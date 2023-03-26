import { Injectable } from '@nestjs/common';
import { UsersActionsRepository } from './users-actions.repository';
import { CreateUsersActionsDto } from './dto/create-users-actions.dto';

@Injectable()
export class UsersActionsService {
  constructor(private usersActionsRepository: UsersActionsRepository) {}

  async createAndGetCount(createUsersActionsDto: CreateUsersActionsDto): Promise<number | null> {
    // Add new action to db
    await this.usersActionsRepository.create(createUsersActionsDto);

    // Delete expired actions
    await this.usersActionsRepository.deleteExpiredActions();

    // Get actions count of current user(ip)
    return await this.usersActionsRepository.getUserActionsCount(
      createUsersActionsDto.ip,
      createUsersActionsDto.resource,
    );
  }
}
