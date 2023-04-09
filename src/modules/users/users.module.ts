import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { UsersQueryRepository } from './users.query-repository';
import { UserExistsRule } from './validators/user-exists.validator';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), CqrsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersQueryRepository, UserExistsRule],
  exports: [UsersService, UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
