import { BlogOwnerInfoDto } from './blog-owner-info.dto';

export class ViewExtendedBlogDto {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public blogOwnerInfo: BlogOwnerInfoDto,
  ) {}
}
