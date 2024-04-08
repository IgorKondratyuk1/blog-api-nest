import { UpdateCommentDto } from '../models/input/update-comment.dto';
import { CreateCommentDto } from '../models/input/create-comment.dto';
import { CommentatorInfoEntity } from './commentator-info.entity';
import IdGenerator from '../../../../../common/utils/id-generator';

export class CommentEntity {
  public id: string;
  public createdAt: Date;
  public content: string;
  public postId: string;
  public blogId: string;
  public commentatorInfo: CommentatorInfoEntity;
  public isBanned: boolean;

  constructor(
    id: string,
    createdAt: Date,
    content: string,
    commentatorInfo: CommentatorInfoEntity,
    postId: string,
    blogId: string,
    isBanned: boolean,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.content = content;
    this.commentatorInfo = commentatorInfo; //new CommentatorInfoEntity(userId, userLogin);
    this.postId = postId;
    this.blogId = blogId;
    this.isBanned = isBanned;
  }

  public updateComment(updateCommentDto: UpdateCommentDto) {
    this.content = updateCommentDto.content;
  }

  public static createInstance(
    createCommentDto: CreateCommentDto,
    userId: string,
    userLogin: string,
    postId: string,
    blogId: string,
  ) {
    return new CommentEntity(
      IdGenerator.generate(),
      new Date(),
      createCommentDto.content,
      new CommentatorInfoEntity(userId, userLogin),
      postId,
      blogId,
      false,
    );
  }
}
