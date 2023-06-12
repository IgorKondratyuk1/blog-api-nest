import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { randomUUID } from 'crypto';
import { HydratedDocument } from 'mongoose';
import { CreatePostOfBlogDto } from '../dto/create-post-of-blog.dto';
import { UpdatePostOfBlogDto } from '../dto/update-post-of-blog.dto';

export type PostDocument = HydratedDocument<Post>;

// @Schema({ _id: false })
// class ExtendedLikesInfo {
//   constructor(likesCount, dislikesCount) {
//     this.likesCount = likesCount;
//     this.dislikesCount = dislikesCount;
//   }
//
//   @Prop({ type: Number, default: 0, min: 0 })
//   likesCount: number;
//
//   @Prop({ type: Number, default: 0, min: 0 })
//   dislikesCount: number;
// }

@Schema()
export class Post {
  constructor(userId, title, blogId, shortDescription, content, blogName) {
    this.id = randomUUID();
    this.userId = userId;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
    this.createdAt = new Date();
    this.isBanned = false;
    //this.extendedLikesInfo = new ExtendedLikesInfo(0, 0);
  }

  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  shortDescription: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({
    type: Date,
    default: () => {
      new Date();
    },
  })
  createdAt: Date;

  @Prop({ type: Boolean, required: true, default: false })
  isBanned: boolean;

  // @Prop({ type: ExtendedLikesInfo, required: true })
  // extendedLikesInfo: ExtendedLikesInfo;

  // public setLikesCount(likesCount: number) {
  //   if (likesCount < 0)
  //     throw new Error('LikesCount must be equal or greater than 0');
  //   this.extendedLikesInfo.likesCount = likesCount;
  // }
  //
  // public setDislikesCount(dislikesCount: number) {
  //   if (dislikesCount < 0)
  //     throw new Error('DislikesCount must be equal or greater than 0');
  //   this.extendedLikesInfo.dislikesCount = dislikesCount;
  // }

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
    return new Post(
      userId,
      createPostDto.title,
      blogId,
      createPostDto.shortDescription,
      createPostDto.content,
      blogName,
    );
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  updatePost: Post.prototype.updatePost,
  updateBlogId: Post.prototype.updateBlogId,
  setIsBanned: Post.prototype.setIsBanned,
};

PostSchema.statics = {
  createInstance: Post.createInstance,
};
