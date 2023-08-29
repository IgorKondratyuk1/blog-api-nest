import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { Blog, BlogSchema } from '../../src/modules/blog-composition/modules/blogs/schemas/blog.schema';
import { User, UserSchema } from '../../src/modules/users/repository/mongoose/schemas/user.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule } from '../../src/config/app-config.module';
import { DbConfigService } from '../../src/config/config-services/db-config.service';
import { AppModule } from '../../src/app.module';
import { setupApp } from '../../src/setup-app';

jest.setTimeout(100000);

describe('Super-admin tests (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let connectionUri;
  let mongoConnection: Connection;

  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    connectionUri = mongod.getUri();
    mongoConnection = (await connect(connectionUri)).connection;

    userModel = mongoConnection.model(User.name, UserSchema);
  });
  afterAll(async () => {
    await mongod.stop();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          imports: [AppConfigModule],
          inject: [DbConfigService],
          useFactory: async () => {
            return { uri: connectionUri };
          },
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.listen(3000);
    console.log('\u001b[36m' + `Tests is running on: ${connectionUri}` + '\x1b[0m');
  });
  afterAll(() => {
    app.close();
  });
});
