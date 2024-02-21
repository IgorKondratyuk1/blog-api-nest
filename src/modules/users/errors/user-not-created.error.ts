import { CustomError } from '../../../common/errors/CustomError';

export class UserNotCreatedError extends CustomError {
  constructor(public message: string) {
    super(message);
    this.name = 'UserNotCreatedError';
  }
}
