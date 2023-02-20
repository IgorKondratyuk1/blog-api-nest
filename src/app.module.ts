import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { BlogsCompositionModule } from './modules/blogs/blogs.composition.module';
import { CommentsModule } from './modules/blogs/modules/comments/comments.module';
import { SETTINGS } from './configs';
import { TestingModule } from './modules/testing/testing.module';

@Module({
  imports: [
    MongooseModule.forRoot(SETTINGS.MONGO_URL, {
      dbName: SETTINGS.MONGO_DB_NAME,
    }),
    UsersModule,
    BlogsCompositionModule,
    CommentsModule,
    TestingModule,
  ],
})
export class AppModule {}
