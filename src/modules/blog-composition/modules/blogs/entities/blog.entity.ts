import { BanInfoEntity } from '../../../../ban/entities/ban-info.entety';
import { UpdateBlogDto } from '../models/input/update-blog.dto';
import { CreateBlogDto } from '../models/input/create-blog.dto';
import IdGenerator from '../../../../../common/utils/id-generator';

export class BlogEntity {
  public id: string;
  public userId: string;
  public name: string;
  public websiteUrl: string;
  public description: string;
  public isMembership: boolean;
  public createdAt: Date;
  public banInfo: BanInfoEntity;

  constructor(
    id: string,
    userId: string,
    name: string,
    websiteUrl: string,
    description: string,
    isMembership: boolean,
    createdAt: Date,
    banInfo: BanInfoEntity,
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.websiteUrl = websiteUrl;
    this.description = description;
    this.isMembership = isMembership;
    this.createdAt = createdAt;
    this.banInfo = banInfo;
  }

  public updateBlog(updateBlogDto: UpdateBlogDto) {
    this.name = updateBlogDto.name;
    this.description = updateBlogDto.description;
    this.websiteUrl = updateBlogDto.websiteUrl;
  }

  public setOwner(userId: string) {
    this.userId = userId;
  }

  public setIsBanned(isBanned: boolean) {
    this.banInfo.isBanned = isBanned;
    this.banInfo.banDate = isBanned ? new Date() : null;
  }

  public static createInstance(userId: string, createBlogDto: CreateBlogDto) {
    return new BlogEntity(
      IdGenerator.generate(),
      userId,
      createBlogDto.name,
      createBlogDto.websiteUrl,
      createBlogDto.description,
      false,
      new Date(),
      new BanInfoEntity(false, null),
    );
  }
}
