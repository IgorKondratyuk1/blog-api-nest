import { BlogEntity } from '../entities/blog.entity';

export abstract class BlogsRepository {
  public abstract save(blog: BlogEntity): Promise<boolean>;

  public abstract create(blog: BlogEntity): Promise<BlogEntity | null>;

  public abstract findById(id: string): Promise<BlogEntity | null>;

  public abstract findByUserId(userId: string): Promise<BlogEntity[]>;

  public abstract remove(id: string): Promise<boolean>;

  public abstract removeAll(): Promise<boolean>;
}
