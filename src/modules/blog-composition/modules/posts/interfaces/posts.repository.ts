import { PostEntity } from '../entities/post.entity';

export abstract class PostsRepository {
  public abstract save(blog: PostEntity): Promise<boolean>;

  public abstract create(blog: PostEntity): Promise<PostEntity | null>;

  public abstract findById(id: string): Promise<PostEntity | null>;

  public abstract setBanStatusByUserId(userId: string, isBanned: boolean): Promise<boolean>;

  public abstract setBanStatusByBlogId(blogId: string, isBanned: boolean): Promise<boolean>;

  public abstract remove(id: string): Promise<boolean>;

  public abstract removeAll(): Promise<boolean>;
}
