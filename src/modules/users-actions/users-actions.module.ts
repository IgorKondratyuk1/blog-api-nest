import { Module } from '@nestjs/common';
import { UsersActionsService } from './users-actions.service';
import { AppConfigModule } from '../../config/app-config.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersActions, UsersActionsSchema } from './schemas/users-actions.schema';
import { UsersActionsRepository } from './users-actions.repository';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forFeature([{ name: UsersActions.name, schema: UsersActionsSchema }]),
  ],
  providers: [UsersActionsService, UsersActionsRepository],
})
export class UsersActionsModule {}
