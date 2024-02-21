import { add } from 'date-fns';
import IdGenerator from '../../../common/utils/id-generator';

export default class EmailConfirmationEntity {
  constructor(public confirmationCode: string, public expirationDate: Date, public isConfirmed: boolean) {}

  public static generateNewExpirationDate() {
    return add(new Date(), {
      hours: 1,
    });
  }

  public static createInstance(): EmailConfirmationEntity {
    const expirationDate = EmailConfirmationEntity.generateNewExpirationDate();
    const confirmationCode = IdGenerator.generate();
    return new EmailConfirmationEntity(confirmationCode, expirationDate, false);
  }
}
