import { BadRequestExceptionFilter } from './bad-request.filter';

describe('BadRequestExceptionFilterFilter', () => {
  it('should be defined', () => {
    expect(new BadRequestExceptionFilter()).toBeDefined();
  });
});
