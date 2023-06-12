import request from 'supertest';
import { PaginationDto } from '../../../src/common/dto/pagination';
import { ViewBlogDto } from '../../../src/modules/blog-composition/modules/blogs/dto/view-blog.dto';
import { connect, Connection, Model } from 'mongoose';
import { User, UserSchema } from '../../../src/modules/users/schemas/user.schema';
import { AppConfigModule } from '../../../src/config/app-config.module';
import { DbConfigService } from '../../../src/config/config-services/db-config.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  Blog,
  BlogDocument,
  BlogSchema,
} from '../../../src/modules/blog-composition/modules/blogs/schemas/blog.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { setupApp } from '../../../src/setup-app';
import { INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../../src/modules/users/dto/create-user.dto';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';
import { ViewAccessTokenDto } from '../../../src/modules/auth/dto/view-access-token.dto';
import { CreateBlogModel } from '../../deprecated/models/blog/createBlogModel';
import { ViewBlogModel } from '../../deprecated/models/blog/viewBlogModel';
import { APIErrorResult, Paginator } from '../../deprecated/types/types';
import { UpdateBlogModel } from '../../deprecated/models/blog/updateBlogModel';
import { BlogMapper } from '../../../src/modules/blog-composition/modules/blogs/utils/blogs.mapper';
import { CreatePostOfBlogDto } from '../../../src/modules/blog-composition/modules/posts/dto/create-post-of-blog.dto';
import { ViewPostDto } from '../../../src/modules/blog-composition/modules/posts/dto/view-post.dto';
import { CreateBlogDto } from '../../../src/modules/blog-composition/modules/blogs/dto/create-blog.dto';
import { PostDocument, PostSchema } from '../../../src/modules/blog-composition/modules/posts/schemas/post.schema';
import { PostsMapper } from '../../../src/modules/blog-composition/modules/posts/utils/posts.mapper';
import { Post } from '../../../src/modules/blog-composition/modules/posts/schemas/post.schema';
import { delay } from '../test-helpers';
import process from 'process';
export const basicAuthValue = 'Basic YWRtaW46cXdlcnR5';
export const usersPassword = '12345678';

jest.setTimeout(100000);
const PORT = Number(process.env.PORT || 3000) + 1;

describe('Blogger (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let connectionUri;
  let mongoConnection: Connection;

  const testsData = {
    jwtToken: '',
    blogs: [],
    posts: [],
  };

  let blogModel: Model<Blog>;
  let postModel: Model<Post>;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    connectionUri = mongod.getUri();
    mongoConnection = (await connect(connectionUri)).connection;

    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
  });
  afterAll(async () => {
    await mongod.stop();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          imports: [AppConfigModule],
          inject: [DbConfigService],
          useFactory: async () => {
            return { uri: connectionUri };
          },
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.listen(PORT);
    console.log('\u001b[36m' + `Tests is running on: ${connectionUri}` + '\x1b[0m');
  });
  afterAll(() => {
    app.close();
  });

  describe('SA should create user', () => {
    const createUser: CreateUserDto = {
      email: 'test@mail.com',
      password: 'password',
      login: 'createUser',
    };

    const expectedUser = {
      id: expect.any(String),
      login: createUser.login,
      email: createUser.email,
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banReason: null,
        banDate: null,
      },
    };

    it('POST: should create new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sa/users')
        .set('Authorization', basicAuthValue)
        .send(createUser);

      //console.log(JSON.stringify(response.body));
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expectedUser);
    });

    it('POST: should login with creted user', async () => {
      const loginData: LoginDto = { loginOrEmail: createUser.email, password: createUser.password };
      const expectedToken: ViewAccessTokenDto = { accessToken: expect.any(String) };
      const response = await request(app.getHttpServer()).post('/api/auth/login').send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedToken);
      testsData.jwtToken = response.body.accessToken;
    });
  });

  describe('Blog', () => {
    afterAll(() => {
      testsData.blogs = [];
    });

    // GET
    it('GET: should return empty array of Blogs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`);
      const expectedData: PaginationDto<ViewBlogDto> = new PaginationDto<ViewBlogDto>(0, 1, 10, 0, []);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedData);
    });

    it('POST: should create first blog', async () => {
      const createBlogModel: CreateBlogModel = {
        name: 'New Blog',
        websiteUrl: 'https://www.youtube.com',
        description: 'some description',
      };
      const expectedBlog: ViewBlogModel = {
        id: expect.any(String),
        name: createBlogModel.name,
        websiteUrl: createBlogModel.websiteUrl,
        description: createBlogModel.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .post('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(createBlogModel);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedBlog);

      testsData.blogs.push(result.body);
    });

    it('GET: should return created blog', async () => {
      const result = await request(app.getHttpServer())
        .get('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`);

      expect(result.status).toBe(200);
      expect(result.body.items[0]).toEqual(testsData.blogs[0]);
    });

    it('POST: should create blog with spaces', async () => {
      const createBlogModel: CreateBlogModel = {
        name: '   Google       ',
        websiteUrl: 'https://www.google.com',
        description: 'some description',
      };
      const expecedBlog: ViewBlogModel = {
        id: expect.any(String),
        name: createBlogModel.name.trim(),
        websiteUrl: createBlogModel.websiteUrl,
        description: createBlogModel.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .post('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(createBlogModel);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expecedBlog);

      testsData.blogs.push(result.body);
    });

    it('GET: should return created blogs', async () => {
      const result = await request(app.getHttpServer())
        .get('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`);

      const expectedObj: Paginator<ViewBlogModel> = {
        page: 1,
        pageSize: 10,
        pagesCount: 1,
        totalCount: 2,
        items: expect.any(Array),
      };

      expect(result.body).toEqual(expectedObj);
      expect(result.body.items.length).toBe(2);
      expect(result.body.items[0]).toEqual(testsData.blogs[1]);
      expect(result.body.items[1]).toEqual(testsData.blogs[0]);
    });

    it('GET: should return correct blog with query', async () => {
      const result = await request(app.getHttpServer())
        .get('/api/blogger/blogs?searchNameTerm=google')
        .set('Authorization', `Bearer ${testsData.jwtToken}`);

      expect(result.status).toBe(200);
      expect(result.body.items[0]).toEqual(testsData.blogs.find((blog) => blog.name === 'Google'));
    });

    it('POST: shouldn`t create blog with lenth > 15', async () => {
      const createBlogModel: CreateBlogModel = {
        name: '1234567890123456',
        websiteUrl: 'https://www.youtube.com',
        description: 'some description',
      };
      const expectedError: APIErrorResult = {
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'name',
          },
        ],
      };

      const result = await request(app.getHttpServer())
        .post('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(createBlogModel);

      expect(result.status).toBe(400);
      expect(result.body).toEqual(expectedError);
    });

    it('POST: shouldn`t create blog without websiteUrl', async () => {
      const expectedError: APIErrorResult = {
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'websiteUrl',
          },
          {
            message: expect.any(String),
            field: 'description',
          },
        ],
      };

      const result = await request(app.getHttpServer())
        .post('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send({ name: 'New blog' });

      expect(result.status).toBe(400);
      expect(result.body).toEqual(expectedError);
    });

    it('POST: shouldn`t create blog with lentgth > 100', async () => {
      const createBlogModel: CreateBlogModel = {
        name: 'New post',
        websiteUrl:
          'https://www.youtube.comLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean m1',
        description: 'some description',
      };
      const expectedError: APIErrorResult = {
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'websiteUrl',
          },
        ],
      };

      const result = await request(app.getHttpServer())
        .post('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(createBlogModel);

      expect(result.status).toBe(400);
      expect(result.body).toEqual(expectedError);
    });

    it('Timeout', async () => {
      await delay(5000);
    });

    it('POST: shouldn`t create blog with wrong url', async () => {
      const createBlogModel: CreateBlogModel = {
        name: 'New blog',
        websiteUrl: 'https:\\/www.youtube.com',
        description: 'some description',
      };
      const expectedError = {
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'websiteUrl',
          },
        ],
      };

      const result = await request(app.getHttpServer())
        .post('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(createBlogModel);

      expect(result.status).toBe(400);
      expect(result.body).toEqual(expectedError);
    });

    // PUT
    it('PUT: blog should be updated by correct data', async () => {
      const updateBlogModel: UpdateBlogModel = {
        name: 'Changed title',
        websiteUrl: 'https://www.google.com',
        description: 'some description',
      };

      const expectedBlog: ViewBlogModel = {
        id: expect.any(String),
        name: updateBlogModel.name,
        websiteUrl: updateBlogModel.websiteUrl,
        description: updateBlogModel.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .put(`/api/blogger/blogs/${testsData.blogs[0].id}`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(updateBlogModel);

      expect(result.status).toBe(204);

      const dbBlog: BlogDocument = await blogModel.findOne({ id: testsData.blogs[0].id });
      expect(BlogMapper.toView(dbBlog)).toEqual(expectedBlog);
    });

    // PUT
    it('PUT: blog should be updated by correct data', async () => {
      const updateBlogModel: UpdateBlogModel = {
        name: 'Changed title',
        websiteUrl: 'https://www.google.com',
        description: 'some description',
      };

      const expectedBlog: ViewBlogModel = {
        id: expect.any(String),
        name: updateBlogModel.name,
        websiteUrl: updateBlogModel.websiteUrl,
        description: updateBlogModel.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .put(`/api/blogger/blogs/${testsData.blogs[0].id}`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send({ websiteUrl: 'https://www.google.com' });

      expect(result.status).toBe(400);

      const dbBlog: BlogDocument = await blogModel.findOne({ id: testsData.blogs[0].id });
      expect(BlogMapper.toView(dbBlog)).toEqual(expectedBlog);
    });

    it('PUT: blog shouldn`t be updated by wrong data (without wrong id)', async () => {
      const updateBlogModel: UpdateBlogModel = {
        name: 'Changed Title',
        websiteUrl: 'https://www.google.com',
        description: 'some description',
      };

      const result = await request(app.getHttpServer())
        .put('/api/blogger/blogs/1111')
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(updateBlogModel);

      expect(result.status).toBe(404);
    });

    // DELETE
    it('DELETE: blog shouldn`t be deleted (wrong id)', async () => {
      const result = await request(app.getHttpServer())
        .delete('/api/blogger/blogs/1111')
        .set('Authorization', `Bearer ${testsData.jwtToken}`);

      expect(result.status).toBe(404);
    });

    it('DELETE: blog should be deleted', async () => {
      const result_1 = await request(app.getHttpServer())
        .delete(`/api/blogger/blogs/${testsData.blogs[0].id}`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .expect(204);

      const result_2 = await request(app.getHttpServer())
        .delete(`/api/blogger/blogs/${testsData.blogs[1].id}`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .expect(204);
    });

    it('GET: should return created blogs', async () => {
      const result = await request(app.getHttpServer())
        .get('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`);

      const expectedObj: Paginator<ViewBlogModel> = {
        page: 1,
        pageSize: 10,
        pagesCount: 0,
        totalCount: 0,
        items: expect.any(Array),
      };

      expect(result.body).toEqual(expectedObj);
      expect(result.body.items.length).toBe(0);
    });
  });

  describe('Posts', () => {
    afterAll(() => {
      testsData.blogs = [];
      testsData.posts = [];
    });

    it('POST: should create first blog', async () => {
      const createBlogModel: CreateBlogModel = {
        name: 'Blog 1',
        websiteUrl: 'https://www.youtube.com',
        description: 'some description',
      };
      const expectedBlog: ViewBlogModel = {
        id: expect.any(String),
        name: createBlogModel.name,
        websiteUrl: createBlogModel.websiteUrl,
        description: createBlogModel.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .post('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(createBlogModel);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedBlog);

      testsData.blogs.push(result.body);
    });

    it('POST: should create second blog', async () => {
      const createBlogModel: CreateBlogDto = {
        name: 'Blog 2',
        websiteUrl: 'https://www.google.com',
        description: 'some description',
      };
      const expectedBlog: ViewBlogModel = {
        id: expect.any(String),
        name: createBlogModel.name,
        websiteUrl: createBlogModel.websiteUrl,
        description: createBlogModel.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .post('/api/blogger/blogs')
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(createBlogModel);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedBlog);

      testsData.blogs.push(result.body);
    });

    it('POST: should create post in first blog', async () => {
      const createPost: CreatePostOfBlogDto = {
        title: 'Post 1 of Blog 1',
        shortDescription: 'some descr',
        content: 'content',
      };

      const expectedPost: ViewPostDto = {
        id: expect.any(String),
        content: createPost.content,
        blogId: testsData.blogs[0].id,
        blogName: testsData.blogs[0].name,
        shortDescription: createPost.shortDescription,
        title: createPost.title,
        createdAt: expect.any(String),
        extendedLikesInfo: expect.any(Object),
      };

      const result = await request(app.getHttpServer())
        .post(`/api/blogger/blogs/${testsData.blogs[0].id}/posts`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(createPost);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedPost);

      const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
      expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

      testsData.posts.push(result.body);
    });

    it('POST: should create post in second blog', async () => {
      const createPost: CreatePostOfBlogDto = {
        title: 'Post 1 of Blog 2',
        shortDescription: 'some descr',
        content: 'content',
      };

      const expectedPost: ViewPostDto = {
        id: expect.any(String),
        content: createPost.content,
        blogId: testsData.blogs[1].id,
        blogName: testsData.blogs[1].name,
        shortDescription: createPost.shortDescription,
        title: createPost.title,
        createdAt: expect.any(String),
        extendedLikesInfo: expect.any(Object),
      };

      const result = await request(app.getHttpServer())
        .post(`/api/blogger/blogs/${testsData.blogs[1].id}/posts`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(createPost);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedPost);

      const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
      expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

      testsData.posts.push(result.body);
    });

    it('PUT: should update post in first blog', async () => {
      const createPost: CreatePostOfBlogDto = {
        title: 'Updated Post 1 of Blog 1',
        shortDescription: 'updated some descr',
        content: 'updated content',
      };

      const expectedPost: ViewPostDto = {
        id: expect.any(String),
        content: createPost.content,
        blogId: testsData.blogs[0].id,
        blogName: testsData.blogs[0].name,
        shortDescription: createPost.shortDescription,
        title: createPost.title,
        createdAt: expect.any(String),
        extendedLikesInfo: expect.any(Object),
      };

      const result = await request(app.getHttpServer())
        .put(`/api/blogger/blogs/${testsData.blogs[0].id}/posts/${testsData.posts[0].id}`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`)
        .send(createPost);

      expect(result.status).toBe(204);

      const dbPost: PostDocument = await postModel.findOne({ id: testsData.posts[0].id });
      expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);
    });

    it('DELETE: shouldn`t update post with wrong id', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/api/blogger/blogs/${testsData.blogs[0].id}/posts/1`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`);

      expect(result.status).toBe(404);
    });

    it('DELETE: shouldn`t update post with wrong blog id', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/api/blogger/blogs/1/posts/${testsData.posts[0].id}`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`);

      expect(result.status).toBe(404);
    });

    it('DELETE: should delete post in first blog', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/api/blogger/blogs/${testsData.blogs[0].id}/posts/${testsData.posts[0].id}`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`);

      expect(result.status).toBe(204);

      const dbPost: PostDocument | null = await postModel.findOne({ id: testsData.posts[0].id });
      expect(dbPost).toBeNull();
    });

    it('DELETE: should delete post in second blog', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/api/blogger/blogs/${testsData.blogs[1].id}/posts/${testsData.posts[1].id}`)
        .set('Authorization', `Bearer ${testsData.jwtToken}`);

      expect(result.status).toBe(204);

      const dbPost: PostDocument | null = await postModel.findOne({ id: testsData.posts[1].id });
      expect(dbPost).toBeNull();
    });
  });
});
