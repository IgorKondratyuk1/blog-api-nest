import { CustomError } from '../../../common/errors/CustomError';

export class UserNotFoundError extends CustomError {
  constructor(public message: string) {
    super(message);
    this.name = 'UserNotFoundError';
  }
}
