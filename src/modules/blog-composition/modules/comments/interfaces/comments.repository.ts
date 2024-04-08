import { CommentEntity } from '../entities/comment.entity';

export abstract class CommentsRepository {
  public abstract save(comment: CommentEntity): Promise<boolean>;

  public abstract create(commentEntity: CommentEntity): Promise<CommentEntity | null>;

  public abstract findById(id: string): Promise<CommentEntity | null>;

  public abstract setBanStatusToUserComments(userId: string, isBanned: boolean): Promise<boolean>;

  public abstract remove(id: string): Promise<boolean>;

  public abstract removeAll(): Promise<boolean>;
}
