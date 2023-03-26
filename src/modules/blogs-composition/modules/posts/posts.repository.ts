import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { CreatePostOfBlogModel } from '../../../../../test/models/post/createPostOfBlog';
import { CreatePostOfBlogDto } from './dto/create-post-of-blog.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async save(post: PostDocument) {
    try {
      await post.save();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(
    createPostDto: CreatePostDto | CreatePostOfBlogDto,
    blogId: string,
    blogName: string,
  ) {
    const newPost: Post = Post.createInstance(createPostDto, blogId, blogName);
    const result: PostDocument = await this.postModel.create(newPost);
    return result;
  }

  async findById(id: string) {
    return this.postModel.findOne({ id });
  }

  async remove(id: string) {
    try {
      const result = await this.postModel.deleteOne({ id });
      return result.deletedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll() {
    return this.postModel.deleteMany({});
  }
}
