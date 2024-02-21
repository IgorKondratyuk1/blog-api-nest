export class BlogsRepositoryMock {
  save = jest.fn();
  create = jest.fn();
  findById = jest.fn();
  findByUserId = jest.fn();
  remove = jest.fn();
  removeAll = jest.fn();
}
