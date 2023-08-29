import { add } from 'date-fns';
import IdGenerator from '../../../common/utils/id-generator';

export default class EmailConfirmation {
  constructor(public confirmationCode: string, public expirationDate: Date, public isConfirmed: boolean) {}

  public static generateNewExpirationDate() {
    return add(new Date(), {
      hours: 1,
    });
  }

  public static createInstance(): EmailConfirmation {
    const expirationDate = EmailConfirmation.generateNewExpirationDate();
    const confirmationCode = IdGenerator.generate();
    return new EmailConfirmation(confirmationCode, expirationDate, false);
  }
}
