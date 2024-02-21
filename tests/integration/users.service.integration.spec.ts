import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../../src/modules/users/interfaces/users.repository';
import { UsersService } from '../../src/modules/users/users.service';
import { DbConfigService } from '../../src/config/config-services/db-config.service';
import UserEntity from '../../src/modules/users/entities/user.entity';
import AccountEntity from '../../src/modules/users/entities/account.entity';
import SaUserBanInfo from '../../src/modules/ban/models/sa-user-ban.info';
import EmailConfirmationEntity from '../../src/modules/users/entities/email-confirmation.entity';
import PasswordRecoveryEntity from '../../src/modules/users/entities/password-recovery.entity';
import { AppModule } from '../../src/app.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { CreateUserDto } from '../../src/modules/users/models/input/create-user.dto';
import { DataSource } from 'typeorm';
import { Model } from 'mongoose';
import { UserDocument, UserMongoEntity } from '../../src/modules/users/repository/mongoose/schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

describe('Unit Tests: UsersService', () => {
  let usersService: UsersService;
  let usersRepository: UsersRepository;
  let dbConfigService: DbConfigService;
  let dataSource: DataSource;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule],
      providers: [UsersService],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    dbConfigService = module.get<DbConfigService>(DbConfigService);
    dataSource = module.get<DataSource>(DataSource);
    userModel = module.get<Model<UserDocument>>(getModelToken(UserMongoEntity.name));
  });

  describe('Test Suit UsersService', () => {
    it('UsersService And UsersRepository should be defined', () => {
      expect(usersService).toBeDefined();
      expect(usersRepository).toBeDefined();
    });

    it('create user', async () => {
      const testUserEntity: UserEntity = new UserEntity(
        '123',
        new Date(),
        new AccountEntity('login-' + randomUUID(), 'email-' + randomUUID(), 'password-123', new Date()),
        new SaUserBanInfo(false, null, null),
        new EmailConfirmationEntity('a', new Date(), true),
        new PasswordRecoveryEntity('a', new Date(), false),
      );

      jest.spyOn(usersRepository, 'create');

      const result = await usersService.create(
        {
          login: testUserEntity.accountData.login,
          email: testUserEntity.accountData.email,
          password: '123',
        } as CreateUserDto,
        false,
      );

      console.log('result');
      console.log(result);

      expect(usersRepository.create).toHaveBeenCalled();
      expect(result.id).toBeDefined();

      if (dbConfigService.dbType === 'sql') {
        // Test SQL
        const findUserQuery =
          'SELECT u.id as "userId", u.user_ban_id as "userBanId", u.created_at as "createdAt", u.account_id as "accountId" FROM public."user" u WHERE u.id = $1;';
        const findUserResult = await dataSource.query(findUserQuery, [result.id]);

        console.log('findUserResult');
        console.log(findUserResult);
        expect(findUserResult[0]).toBeDefined();

        const findUserAccountQuery =
          'SELECT ac.id as "accountId", ac.login as "login", ac.email as "email", ac.password_hash as "passwordHash" FROM public."account" ac WHERE ac.id = $1;';
        const findUserAccountResult = await dataSource.query(findUserAccountQuery, [findUserResult[0].accountId]);

        console.log('findUserAccountResult');
        console.log(findUserAccountResult);
        expect(findUserAccountResult[0]).toBeDefined();
        expect(findUserAccountResult[0].login).toBe(testUserEntity.accountData.login);
        expect(findUserAccountResult[0].email).toBe(testUserEntity.accountData.email);
      } else {
        // Test Mongo
        const findModel = await userModel.findOne({ id: result.id });
        console.log('findModel');
        console.log(findModel);
        expect(findModel).toBeDefined();
        expect(findModel.accountData.login).toBe(testUserEntity.accountData.login);
        expect(findModel.accountData.email).toBe(testUserEntity.accountData.email);
      }
    });
  });
});
