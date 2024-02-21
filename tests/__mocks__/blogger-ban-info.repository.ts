export class BloggerBanInfoRepositoryMock {
  create = jest.fn();
  save = jest.fn();
  findByUserIdAndBlogId = jest.fn();
  removeByUserIdAndBlogId = jest.fn();
  removeAll = jest.fn();
}
