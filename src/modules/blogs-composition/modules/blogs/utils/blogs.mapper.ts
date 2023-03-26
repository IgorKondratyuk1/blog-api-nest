import { Blog, BlogDocument } from '../schemas/blog.schema';
import { ViewBlogDto } from '../dto/view-blog.dto';

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
}
