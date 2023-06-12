import request from 'supertest';
import { CreateUserModel } from '../models/user/createUserModel';
import { ViewUserModel } from '../models/user/viewUserModel';
import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import cookieParser from 'cookie-parser';
import { BadRequestExceptionFilter } from '../../../src/common/exception-filters/bad-request/bad-request.filter';
import { useContainer } from 'class-validator';

const basicAuthValue = 'Basic YWRtaW46cXdlcnR5';
const usersPassword = '12345678';

describe('/users', () => {
  const baseUrl = 'http://localhost:3000/api';
  let firstUser: any = null;

  let app: INestApplication;

  beforeAll(async () => {
    // const moduleFixture: TestingModule = await Test.createTestingModule({
    //   imports: [AppModule],
    // }).compile();
    //
    // app = moduleFixture.createNestApplication();
    // new ValidationPipe({
    //   stopAtFirstError: true,
    //   transform: true,
    //   exceptionFactory: (errors) => {
    //     const errorsForResponse = [];
    //     errors.forEach((e) => {
    //       const keys = Object.keys(e.constraints);
    //       keys.forEach((k) => {
    //         errorsForResponse.push({ field: e.property, message: e.constraints[k] });
    //       });
    //     });
    //     throw new BadRequestException(errorsForResponse);
    //   },
    // });
    //
    // app.use(cookieParser());
    // app.useGlobalFilters(new BadRequestExceptionFilter());
    // useContainer(app.select(AppModule), { fallbackOnErrors: true });
    // await app.listen(3000);

    await request(baseUrl).delete('/testing/all-data').set('Authorization', basicAuthValue);
    console.log('Database is empty');
  });

  // afterAll(async () => {
  //   await app.close();
  // });

  // GET
  it('GET: should return empty array of Users', async () => {
    const response = await request(baseUrl).get('/users').set('Authorization', basicAuthValue);
    expect(response.status).toBe(200);
    expect(response.body.items.length).toBe(0);
  });

  // Create User
  it('POST: should create user', async () => {
    const data: CreateUserModel = {
      email: 'aaaaa1@gmail.com',
      login: 'a1234567',
      password: '1234567',
    };

    const result = await request(baseUrl).post('/users').set('Authorization', basicAuthValue).send(data);

    firstUser = result.body;

    expect(result.status).toBe(201);
    const expectedObj: ViewUserModel = {
      id: expect.any(String),
      login: data.login,
      email: data.email,
      createdAt: expect.any(String),
    };
    expect(result.body).toEqual(expectedObj);
  });

  it('POST: shouldn`t create user without Authorization header', async () => {
    const data: CreateUserModel = {
      email: 'aaaaa1@gmail.com',
      login: 'a1234567',
      password: '1234567',
    };

    await request(baseUrl).post('/users').send(data).expect(401);
  });

  it('POST: shouldn`t create user with incorrect data', async () => {
    const data: CreateUserModel = {
      email: 'aaaaa1f///gmail.com',
      login: '1',
      password: '12',
    };

    const result = await request(baseUrl).post('/users').set('Authorization', basicAuthValue).send(data).expect(400);

    expect(result.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'login',
        },
        {
          message: expect.any(String),
          field: 'password',
        },
        {
          message: expect.any(String),
          field: 'email',
        },
      ],
    });
  });

  // Checking that only one user created
  it('GET: should return one user', async () => {
    const result = await request(baseUrl).get('/users').set('Authorization', basicAuthValue);

    console.log(result.body.items);
    console.log(firstUser);

    expect(result.status).toEqual(200);
    expect(result.body.items.length).toEqual(1);
    expect(result.body.items[0]).toEqual(firstUser);
  });

  // DELETE
  it('DELETE: shouldn`t delete user with wrong id', async () => {
    await request(baseUrl)
      .delete(`/users/1111`) // Post not exists
      .set('Authorization', basicAuthValue)
      .expect(404);
  });

  it('DELETE: should delete user successfully - 204', async () => {
    await request(baseUrl).delete(`/users/${firstUser.id}`).set('Authorization', basicAuthValue).expect(204);
  });

  // Check that arr of users is empty
  it('GET: should return empty array', async () => {
    const result = await request(baseUrl).get('/users').set('Authorization', basicAuthValue);

    expect(result.status).toEqual(200);
    expect(result.body.items).toEqual([]);
  });
});
