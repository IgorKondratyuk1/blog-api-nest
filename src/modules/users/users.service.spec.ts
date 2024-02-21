import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './interfaces/users.repository';
import UserEntity from './entities/user.entity';
import AccountEntity from './entities/account.entity';
import EmailConfirmationEntity from './entities/email-confirmation.entity';
import PasswordRecoveryEntity from './entities/password-recovery.entity';
import SaUserBanInfo from '../ban/models/sa-user-ban.info';
import { UsersRepositoryMock } from '../../../tests/__mocks__/users.repository';

describe('Unit Tests: UsersService', () => {
  let usersService: UsersService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useClass: UsersRepositoryMock, // Use the mock class instead of the actual implementation
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  describe('Test Suit UsersService', () => {
    it('UsersService And UsersRepository should be defined', () => {
      expect(usersService).toBeDefined();
      expect(usersRepository).toBeDefined();
    });

    it('findById', async () => {
      const testUserEntity: UserEntity = new UserEntity(
        '123',
        new Date(),
        new AccountEntity('a', 'a', 'a', new Date()),
        new SaUserBanInfo(false, null, null),
        new EmailConfirmationEntity('a', new Date(), true),
        new PasswordRecoveryEntity('a', new Date(), false),
      );
      jest.spyOn(usersRepository, 'findById').mockImplementation(async () => testUserEntity); // Add mock response to usersRepository
      const result = await usersService.findById('123');
      expect(usersRepository.findById).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('123');
    });
  });
});
