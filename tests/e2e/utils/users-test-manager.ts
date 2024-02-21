import request from 'supertest';
import { basicAuthValue } from './helpers';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../../src/modules/users/models/input/create-user.dto';
import { randomUUID } from 'crypto';

export class UsersTestManager {
  public static async createUser(
    app: INestApplication,
    createUserDto: CreateUserDto = null,
    expectedStatus: HttpStatus = HttpStatus.CREATED,
  ) {
    if (!createUserDto) {
      createUserDto = {
        email: randomUUID() + '@gmail.com',
        login: `login-${randomUUID()}`,
        password: randomUUID(),
      } as CreateUserDto;
    }

    const expectedUser = {
      id: expect.any(String),
      login: createUserDto.login,
      email: createUserDto.email,
      createdAt: expect.any(String),
      // banInfo: {
      //   isBanned: false,
      //   banReason: null,
      //   banDate: null,
      // },
    };

    const response = await request(app.getHttpServer())
      .post('/api/sa/users')
      .set('Authorization', basicAuthValue)
      .send(createUserDto);

    expect(response.status).toBe(expectedStatus);
    expect(response.body).toEqual(expectedUser);

    return { response, createUserDto };
  }
}
