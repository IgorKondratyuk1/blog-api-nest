import { Blog, BlogDocument } from '../schemas/blog.schema';
import { ViewBlogDto } from '../dto/view-blog.dto';
import { ViewExtendedBlogDto } from '../dto/view-extended-blog.dto';
import { BlogOwnerInfoDto } from '../dto/blog-owner-info.dto';

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

  public static toExtendedView(blog: Blog | BlogDocument, userId: string, userLogin: string) {
    const blogOwnerInfo: BlogOwnerInfoDto = new BlogOwnerInfoDto(userId, userLogin);
    return new ViewExtendedBlogDto(
      blog.id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt.toISOString(),
      blog.isMembership,
      blogOwnerInfo,
    );
  }
}
