import { UsersRepository } from '../../src/modules/users/interfaces/users.repository';

export class UsersRepositoryMock implements UsersRepository {
  save = jest.fn();
  create = jest.fn();
  findById = jest.fn();
  findUserByLoginOrEmail = jest.fn();
  findUserByEmailConfirmationCode = jest.fn();
  findUserByPasswordConfirmationCode = jest.fn();
  remove = jest.fn();
  removeAll = jest.fn();
}
