import { add } from 'date-fns';
import IdGenerator from '../../../common/utils/id-generator';

export default class PasswordRecoveryEntity {
  constructor(public recoveryCode: string, public expirationDate: Date, public isUsed: boolean) {}

  public static generateNewExpirationDate() {
    return add(new Date(), {
      hours: 1,
    });
  }

  public static createInstance(): PasswordRecoveryEntity {
    const expirationDate = PasswordRecoveryEntity.generateNewExpirationDate();
    const recoveryCode = IdGenerator.generate();
    return new PasswordRecoveryEntity(recoveryCode, expirationDate, false);
  }
}
