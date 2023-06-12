import { Blog, BlogDocument } from '../schemas/blog.schema';
import { ViewBlogDto } from '../dto/view-blog.dto';
import { ViewExtendedBlogDto } from '../dto/view-extended-blog.dto';
import { BlogOwnerInfoDto } from '../dto/blog-owner-info.dto';
import { User, UserDocument } from '../../../../users/schemas/user.schema';
import { BanMapper } from '../../../../ban/utils/ban-mapper';

export class BlogMapper {
  public static toView(blog: Blog | BlogDocument) {
    return new ViewBlogDto(
      blog.id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt.toISOString(),
      blog.isMembership,
    );
  }

  public static toExtendedView(blog: Blog | BlogDocument, user: UserDocument | User | null) {
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
}
