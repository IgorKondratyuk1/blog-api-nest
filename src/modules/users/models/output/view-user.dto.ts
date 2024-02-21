import { ViewBanExtendedInfoDto } from '../../../ban/dto/output/view-ban-extended-info.dto';

export default class ViewUserDto {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string, //public banInfo: ViewBanExtendedInfoDto,
  ) {}
}
