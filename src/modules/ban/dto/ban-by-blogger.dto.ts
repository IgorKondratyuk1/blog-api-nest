import { BanLocationType } from '../types/ban-locations';

export class BanByBloggerDto {
  constructor(
    public userId: string,
    public userLogin: string,
    public banReason: string,
    public authorId: string,
    public locationId: string,
    public locationName: BanLocationType,
  ) {}
}
