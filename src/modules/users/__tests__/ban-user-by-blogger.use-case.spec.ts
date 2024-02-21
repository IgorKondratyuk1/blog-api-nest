import { Test, TestingModule } from '@nestjs/testing';
import { BanUserByBloggerCommand, BanUserByBloggerUseCase } from '../use-cases/ban-user-by-blogger.use-case';
import { BloggerBanInfoRepository } from '../../ban/blogger-ban-info.repository';
import { BanService } from '../../ban/ban.service';
import { BlogsService } from '../../blog-composition/modules/blogs/blogs.service';
import { UsersService } from '../users.service';
import { UsersRepository } from '../interfaces/users.repository';
import { UsersRepositoryMock } from '../../../../tests/__mocks__/users.repository';
import { BlogsRepositoryMock } from '../../../../tests/__mocks__/blogs.repository';
import { BlogsMongoRepository } from '../../blog-composition/modules/blogs/repository/mongoose/blogs.mongo.repository';
import { BloggerBanInfoRepositoryMock } from '../../../../tests/__mocks__/blogger-ban-info.repository';
import UserEntity from '../entities/user.entity';
import AccountEntity from '../entities/account.entity';
import SaUserBanInfo from '../../ban/models/sa-user-ban.info';
import EmailConfirmationEntity from '../entities/email-confirmation.entity';
import PasswordRecoveryEntity from '../entities/password-recovery.entity';
import {
  BlogMongoEntity,
  BlogDocument,
} from '../../blog-composition/modules/blogs/repository/mongoose/schemas/blog.schema';

describe('Unit Tests: Ban User By Blogger UseCase', () => {
  let bloggerBanInfoRepository: BloggerBanInfoRepository;
  let banService: BanService;
  let usersService: UsersService;
  let blogsService: BlogsService;
  let banUserByBloggerUseCase: BanUserByBloggerUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        BanService,
        BlogsService,
        {
          provide: UsersRepository,
          useClass: UsersRepositoryMock, // Use the mock class instead of the actual implementation
        },
        {
          provide: BlogsMongoRepository,
          useClass: BlogsRepositoryMock, // Use the mock class instead of the actual implementation
        },
        {
          provide: BloggerBanInfoRepository,
          useClass: BloggerBanInfoRepositoryMock, // Use the mock class instead of the actual implementation
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    bloggerBanInfoRepository = module.get<BloggerBanInfoRepository>(BloggerBanInfoRepository);
    banService = module.get<BanService>(BanService);
    blogsService = module.get<BlogsService>(BlogsService);

    banUserByBloggerUseCase = new BanUserByBloggerUseCase(
      bloggerBanInfoRepository,
      banService,
      usersService,
      blogsService,
    );
  });

  describe('Test Suit UsersService', () => {
    it('Services And Repositories should be defined', () => {
      expect(bloggerBanInfoRepository).toBeDefined();
      expect(banService).toBeDefined();
      expect(usersService).toBeDefined();
      expect(blogsService).toBeDefined();
      expect(banUserByBloggerUseCase).toBeDefined();
    });

    it('Ban User use-case', async () => {
      // Prepare Data
      const testBlogDocument = new BlogMongoEntity('123', '1', '1', '1') as BlogDocument;
      const testUserEntity: UserEntity = new UserEntity(
        '123',
        new Date(),
        new AccountEntity('a', 'a', 'a', new Date()),
        new SaUserBanInfo(false, null, null),
        new EmailConfirmationEntity('a', new Date(), true),
        new PasswordRecoveryEntity('a', new Date(), false),
      );

      // Prepare MockImplementations
      jest.spyOn(blogsService, 'findById').mockImplementation(async () => testBlogDocument); // Add mock response to usersRepository
      jest.spyOn(usersService, 'findById').mockImplementation(async () => testUserEntity); // Add mock response to usersRepository

      // Execute UseCase
      const banUseCaseResult = await banUserByBloggerUseCase.execute(
        new BanUserByBloggerCommand('123', 'a', { isBanned: false, banReason: 'a', blogId: '1' }),
      );
      console.log('banUseCaseResult');
      console.log(banUseCaseResult);

      // Check expects
      expect(banUseCaseResult).toBe(true);
    });
  });
});
