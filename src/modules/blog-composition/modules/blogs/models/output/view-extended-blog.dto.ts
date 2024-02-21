import { BlogOwnerInfoDto } from './blog-owner-info.dto';
import { BanInfo } from '../../../../../ban/schemas/ban-info.schema';
import { ViewBanInfoDto } from '../../../../../ban/dto/output/view-ban-info.dto';

export class ViewExtendedBlogDto {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public blogOwnerInfo: BlogOwnerInfoDto | null,
    public banInfo: ViewBanInfoDto,
  ) {}
}
