import { Paginator } from '../../../common/utils/paginator';
import { BanStatusesType } from '../types/ban-statuses';

export class UsersPaginator extends Paginator {
  public static getBanStatus(banStatus: BanStatusesType): boolean | null {
    switch (banStatus) {
      case 'banned':
        return true;
      case 'notBanned':
        return false;
      case 'all':
        return null;
      default:
        return null;
    }
  }
}
