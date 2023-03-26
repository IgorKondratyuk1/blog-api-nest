import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreatePostDto } from '../dto/create-post.dto';
import { randomUUID } from 'crypto';
import { HydratedDocument } from 'mongoose';
import { CreatePostOfBlogDto } from '../dto/create-post-of-blog.dto';

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
  constructor(title, blogId, shortDescription, content, blogName) {
    this.id = randomUUID();
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
    this.createdAt = new Date();
    //this.extendedLikesInfo = new ExtendedLikesInfo(0, 0);
  }

  @Prop({ type: String, required: true })
  id: string;

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

  @Prop({ type: Date, required: true, default: Date })
  createdAt: Date;

  // @Prop({ type: ExtendedLikesInfo, required: true })
  // extendedLikesInfo: ExtendedLikesInfo;

  // TODO what errors throw in methods (native or nest) and how to catch them
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

  public updatePost(updatePostDto: UpdatePostDto) {
    this.blogId = updatePostDto.blogId;
    this.content = updatePostDto.content;
    this.title = updatePostDto.title;
    this.shortDescription = updatePostDto.shortDescription;
  }

  public static createInstance(
    createPostDto: CreatePostDto | CreatePostOfBlogDto,
    blogId: string,
    blogName: string,
  ) {
    return new Post(
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
};

PostSchema.statics = {
  createInstance: Post.createInstance,
};
