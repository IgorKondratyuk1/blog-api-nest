import { PaginationHelper } from '../../../common/utils/paginationHelper';
import { BanStatusesType } from '../../ban/types/ban-statuses';

export class UsersPaginationHelper extends PaginationHelper {
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
