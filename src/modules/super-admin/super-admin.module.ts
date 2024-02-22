import { Module } from '@nestjs/common';
import { SuperAdminBlogsController } from './super-admin-blogs.controller';
import { SuperAdminUsersController } from './super-admin-users.controller';
import { BlogsModule } from '../blog-composition/modules/blogs/blogs.module';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../blog-composition/modules/posts/posts.module';

@Module({
  imports: [BlogsModule, PostsModule, UsersModule, CqrsModule],
  controllers: [SuperAdminBlogsController, SuperAdminUsersController],
  providers: [],
})
export class SuperAdminModule {}
