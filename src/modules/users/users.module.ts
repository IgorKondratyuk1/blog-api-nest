import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { UsersQueryRepository } from './users.query-repository';
import { UserExistsRule } from '../../common/validators/user-exists.validator';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersQueryRepository, UserExistsRule],
  exports: [UsersRepository],
})
export class UsersModule {}
