import { add } from 'date-fns';
import IdGenerator from '../../../common/utils/id-generator';

export default class PasswordRecovery {
  constructor(public recoveryCode: string, public expirationDate: Date, public isUsed: boolean) {}

  public static generateNewExpirationDate() {
    return add(new Date(), {
      hours: 1,
    });
  }

  public static createInstance(): PasswordRecovery {
    const expirationDate = PasswordRecovery.generateNewExpirationDate();
    const recoveryCode = IdGenerator.generate();
    return new PasswordRecovery(recoveryCode, expirationDate, false);
  }
}
