import { ViewBanExtendedInfoDto } from '../../../ban/dto/output/view-ban-extended-info.dto';

export default class ViewUserInfoDto {
  constructor(public id: string, public login: string, public banInfo: ViewBanExtendedInfoDto) {}
}
