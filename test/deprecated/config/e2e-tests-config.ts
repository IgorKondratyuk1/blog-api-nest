import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import process from 'process';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { setupApp } from '../../../src/setup-app';

export const setupBeforeAndAfter = async () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env['MONGO_BASE_URL'] = mongod.getUri();
  });

  afterAll(async () => {
    await mongod.stop();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.listen(3000);
    console.log('\u001b[36m' + `Tests is running on: ${process.env.MONGO_BASE_URL}` + '\x1b[0m');
  });

  afterAll(() => {
    app.close();
  });

  return { app, mongod };
};
