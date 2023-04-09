import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminBlogsController } from './super-admin-blogs.controller';
import { SuperAdminUsersController } from './super-admin-users.controller';
import { BlogsModule } from '../blog-composition/modules/blogs/blogs.module';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [BlogsModule, UsersModule, CqrsModule],
  controllers: [SuperAdminBlogsController, SuperAdminUsersController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}
