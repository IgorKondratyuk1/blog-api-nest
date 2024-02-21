import { UpdatePostOfBlogDto } from '../models/input/update-post-of-blog.dto';
import { CreatePostDto } from '../models/input/create-post.dto';
import { CreatePostOfBlogDto } from '../models/input/create-post-of-blog.dto';
import IdGenerator from '../../../../../common/utils/id-generator';

export class PostEntity {
  public id: string;
  public userId: string;
  public title: string;
  public shortDescription: string;
  public content: string;
  public blogId: string;
  public blogName: string;
  public createdAt: Date;
  public isBanned: boolean;

  constructor(
    id: string,
    userId: string,
    blogName: string,
    blogId: string,
    shortDescription: string,
    content: string,
    title: string,
    createdAt: Date,
    isBanned: boolean,
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
    this.createdAt = createdAt;
    this.isBanned = isBanned;
  }

  public updatePost(updatePostDto: UpdatePostOfBlogDto) {
    this.content = updatePostDto.content;
    this.title = updatePostDto.title;
    this.shortDescription = updatePostDto.shortDescription;
  }

  public updateBlogId(blogId: string) {
    this.blogId = blogId;
  }

  public setIsBanned(isBanned: boolean) {
    this.isBanned = isBanned;
  }

  public static createInstance(
    userId: string,
    blogId: string,
    blogName: string,
    createPostDto: CreatePostDto | CreatePostOfBlogDto,
  ) {
    return new PostEntity(
      IdGenerator.generate(),
      userId,
      blogName,
      blogId,
      createPostDto.shortDescription,
      createPostDto.content,
      createPostDto.title,
      new Date(),
      false,
    );
  }
}
