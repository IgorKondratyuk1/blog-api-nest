import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMongoEntity, UserSchema } from './repository/mongoose/schemas/user.schema';
import { UsersMongoQueryRepository } from './repository/mongoose/users.mongo-query-repository';
import { UserExistsRule } from './validators/user-exists.validator';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersMongoRepository } from './repository/mongoose/users.mongo-repository';
import { UsersPgRepository } from './repository/postgresql/users.pg-repository';
import { DbConfigService } from '../../config/config-services/db-config.service';
import { UsersRepository } from './interfaces/users.repository';
import { UsersQueryRepository } from './interfaces/users.query-repository';
import { UsersPgQueryRepository } from './repository/postgresql/users.pg-query-repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserMongoEntity.name, schema: UserSchema }]), CqrsModule],
  providers: [
    UsersService,
    UsersMongoRepository,
    UsersPgRepository,
    UsersMongoQueryRepository,
    UsersPgQueryRepository,
    UserExistsRule,
    {
      provide: UsersRepository,
      useFactory: async (
        dbConfigService: DbConfigService,
        postgresqlUsersRepository: UsersPgRepository,
        mongooseUsersRepository: UsersMongoRepository,
      ) => {
        console.log('UsersModule DbType:');
        console.log(dbConfigService.dbType);
        return dbConfigService.dbType === 'sql' ? postgresqlUsersRepository : mongooseUsersRepository;
      },
      inject: [DbConfigService, UsersPgRepository, UsersMongoRepository],
    },
    {
      provide: UsersQueryRepository,
      useFactory: async (
        dbConfigService: DbConfigService,
        postgresqlUsersPgQueryRepository: UsersPgQueryRepository,
        mongooseUsersMongoQueryRepository: UsersMongoQueryRepository,
      ) => {
        console.log(dbConfigService.dbType);
        return dbConfigService.dbType === 'sql' ? postgresqlUsersPgQueryRepository : mongooseUsersMongoQueryRepository;
      },
      inject: [DbConfigService, UsersPgQueryRepository, UsersMongoQueryRepository],
    },
  ],
  exports: [UsersService, UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
