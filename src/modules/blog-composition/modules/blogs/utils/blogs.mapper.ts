import { BlogMongoEntity, BlogDocument } from '../repository/mongoose/schemas/blog.schema';
import { ViewBlogDto } from '../models/output/view-blog.dto';
import { ViewExtendedBlogDto } from '../models/output/view-extended-blog.dto';
import { BlogOwnerInfoDto } from '../models/output/blog-owner-info.dto';
import { UserMongoEntity, UserDocument } from '../../../../users/repository/mongoose/schemas/user.schema';
import { BanMapper } from '../../../../ban/utils/ban-mapper';
import UserEntity from '../../../../users/entities/user.entity';
import { BlogEntity } from '../entities/blog.entity';
import { BanInfoEntity } from '../../../../ban/entities/ban-info.entety';
import { DbBlog, DbBlogExtended } from '../repository/postgresql/types/blog';

export class BlogMapper {
  public static toView(blog: BlogMongoEntity | BlogEntity) {
    return new ViewBlogDto(
      blog.id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt.toISOString(),
      blog.isMembership,
    );
  }

  public static toExtendedViewFromDocument(
    blog: BlogMongoEntity | BlogDocument,
    user: UserDocument | UserEntity | UserMongoEntity | null,
  ) {
    const banInfo = BanMapper.toBanInfoView(blog.banInfo.isBanned, blog.banInfo.banDate);
    let blogOwnerInfo: BlogOwnerInfoDto | null = new BlogOwnerInfoDto(null, null); // Initialize with empty userInfo
    if (user) blogOwnerInfo = new BlogOwnerInfoDto(user.id, user.accountData.login);

    return new ViewExtendedBlogDto(
      blog.id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt.toISOString(),
      blog.isMembership,
      blogOwnerInfo,
      banInfo,
    );
  }

  public static toExtendedViewFromPlainSql(dbBlogExtended: DbBlogExtended) {
    const banInfo = BanMapper.toBanInfoView(!!dbBlogExtended.banId, dbBlogExtended.banDate);
    let blogOwnerInfo: BlogOwnerInfoDto | null = new BlogOwnerInfoDto(null, null); // Initialize with empty userInfo
    if (dbBlogExtended.userId) blogOwnerInfo = new BlogOwnerInfoDto(dbBlogExtended.userId, dbBlogExtended.userLogin);

    return new ViewExtendedBlogDto(
      dbBlogExtended.id,
      dbBlogExtended.name,
      dbBlogExtended.description,
      dbBlogExtended.websiteUrl,
      dbBlogExtended.createdAt.toISOString(),
      dbBlogExtended.isMembership,
      blogOwnerInfo,
      banInfo,
    );
  }

  public static toMongo(blogEntity: BlogEntity): BlogMongoEntity {
    return new BlogMongoEntity(
      blogEntity.id,
      blogEntity.userId,
      blogEntity.name,
      blogEntity.websiteUrl,
      blogEntity.description,
      blogEntity.isMembership,
      blogEntity.createdAt,
      blogEntity.banInfo.isBanned,
      blogEntity.banInfo.banDate,
    );
  }

  public static toDomainFromMongo(blogMongoEntity: BlogMongoEntity): BlogEntity {
    return new BlogEntity(
      blogMongoEntity.id,
      blogMongoEntity.userId,
      blogMongoEntity.name,
      blogMongoEntity.websiteUrl,
      blogMongoEntity.description,
      blogMongoEntity.isMembership,
      blogMongoEntity.createdAt,
      new BanInfoEntity(blogMongoEntity.banInfo.isBanned, blogMongoEntity.banInfo.banDate),
    );
  }

  public static toDomainFromPlainSql(dbBlog: DbBlog): BlogEntity {
    return new BlogEntity(
      dbBlog.id,
      dbBlog.userId,
      dbBlog.name,
      dbBlog.websiteUrl,
      dbBlog.description,
      dbBlog.isMembership,
      dbBlog.createdAt,
      new BanInfoEntity(!!dbBlog.banId, dbBlog.banDate),
    );
  }
}
