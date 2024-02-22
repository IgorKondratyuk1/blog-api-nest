import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { setupApp } from '../../../src/setup-app';
import { BlogMapper } from '../../../src/modules/blog-composition/modules/blogs/utils/blogs.mapper';
import { PaginationDto } from '../../../src/common/dto/pagination';
import { ViewExtendedBlogDto } from '../../../src/modules/blog-composition/modules/blogs/models/output/view-extended-blog.dto';
import { CreateUserDto } from '../../../src/modules/users/models/input/create-user.dto';
import ViewUserDto from '../../../src/modules/users/models/output/view-user.dto';
import process from 'process';
import { CreateBlogDto } from '../../../src/modules/blog-composition/modules/blogs/models/input/create-blog.dto';
import { CreateCommentDto } from '../../../src/modules/blog-composition/modules/comments/dto/create-comment.dto';
import { ViewPublicCommentDto } from '../../../src/modules/blog-composition/modules/comments/dto/view-public-comment.dto';
import { LikeStatus } from '../../../src/modules/blog-composition/modules/likes/types/like';
import { BanUserDto } from '../../../src/modules/ban/dto/input/ban-user.dto';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';
import { ViewAccessTokenDto } from '../../../src/modules/auth/dto/view-access-token.dto';
import { UpdateLikeDto } from '../../../src/modules/blog-composition/modules/likes/dto/update-like.dto';
import { ViewBlogDto } from '../../../src/modules/blog-composition/modules/blogs/models/output/view-blog.dto';
import { UsersTestManager } from '../utils/users-test-manager';
import { basicAuthValue, delay } from '../utils/helpers';
import { CreatePostOfBlogDto } from '../../../src/modules/blog-composition/modules/posts/models/input/create-post-of-blog.dto';
import { ViewPostDto } from '../../../src/modules/blog-composition/modules/posts/models/output/view-post.dto';
import { UpdateBlogDto } from '../../../src/modules/blog-composition/modules/blogs/models/input/update-blog.dto';
import { AppConfigModule } from '../../../src/config/app-config.module';

jest.setTimeout(100000);
const PORT = Number(process.env.PORT || 3000) + 3;

describe('Super-admin tests (e2e)', () => {
  let app: INestApplication;

  const testsData = {
    jwtToken: '',
    users: [],
    blogs: [],
    posts: [],
    comments: [],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AppConfigModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.listen(PORT);
  });

  beforeAll(async () => {
    await request(app.getHttpServer()).delete('/api/testing/all-data');
  });

  afterAll(() => {
    app.close();
  });

  describe('Blog', () => {
    afterAll(() => {
      testsData.blogs = [];
    });

    // GET
    it('GET: should return empty array of Blogs', async () => {
      const response = await request(app.getHttpServer()).get('/api/sa/blogs').set('Authorization', basicAuthValue);
      const expectedData: PaginationDto<ViewBlogDto> = new PaginationDto<ViewBlogDto>(0, 1, 10, 0, []);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedData);
    });

    it('POST: should create first blog', async () => {
      const CreateBlogDto: CreateBlogDto = {
        name: 'New Blog',
        websiteUrl: 'https://www.youtube.com',
        description: 'some description',
      };
      const expectedBlog: ViewBlogDto = {
        id: expect.any(String),
        name: CreateBlogDto.name,
        websiteUrl: CreateBlogDto.websiteUrl,
        description: CreateBlogDto.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .post('/api/sa/blogs')
        .set('Authorization', basicAuthValue)
        .send(CreateBlogDto);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedBlog);

      testsData.blogs.push(result.body);
    });

    it('GET: should return created blog', async () => {
      const result = await request(app.getHttpServer()).get('/api/sa/blogs').set('Authorization', basicAuthValue);

      expect(result.status).toBe(200);
      expect(result.body.items[0]).toEqual(testsData.blogs[0]);
    });

    it('POST: should create blog with spaces', async () => {
      const CreateBlogDto: CreateBlogDto = {
        name: '   Google       ',
        websiteUrl: 'https://www.google.com',
        description: 'some description',
      };
      const expecedBlog: ViewBlogDto = {
        id: expect.any(String),
        name: CreateBlogDto.name.trim(),
        websiteUrl: CreateBlogDto.websiteUrl,
        description: CreateBlogDto.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .post('/api/sa/blogs')
        .set('Authorization', basicAuthValue)
        .send(CreateBlogDto);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expecedBlog);

      testsData.blogs.push(result.body);
    });

    it('GET: should return created blogs', async () => {
      const result = await request(app.getHttpServer()).get('/api/sa/blogs').set('Authorization', basicAuthValue);

      const expectedObj: PaginationDto<ViewBlogDto> = {
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
        .get('/api/sa/blogs?searchNameTerm=google')
        .set('Authorization', basicAuthValue);

      expect(result.status).toBe(200);
      expect(result.body.items[0]).toEqual(testsData.blogs.find((blog) => blog.name === 'Google'));
    });

    it('POST: shouldn`t create blog with lenth > 15', async () => {
      const CreateBlogDto: CreateBlogDto = {
        name: '1234567890123456',
        websiteUrl: 'https://www.youtube.com',
        description: 'some description',
      };
      const expectedError = {
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'name',
          },
        ],
      };

      const result = await request(app.getHttpServer())
        .post('/api/sa/blogs')
        .set('Authorization', basicAuthValue)
        .send(CreateBlogDto);

      expect(result.status).toBe(400);
      expect(result.body).toEqual(expectedError);
    });

    it('POST: shouldn`t create blog without websiteUrl', async () => {
      const expectedError = {
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
        .post('/api/sa/blogs')
        .set('Authorization', basicAuthValue)
        .send({ name: 'New blog' });

      expect(result.status).toBe(400);
      expect(result.body).toEqual(expectedError);
    });

    it('POST: shouldn`t create blog with lentgth > 100', async () => {
      const CreateBlogDto: CreateBlogDto = {
        name: 'New post',
        websiteUrl:
          'https://www.youtube.comLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean m1',
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
        .post('/api/sa/blogs')
        .set('Authorization', basicAuthValue)
        .send(CreateBlogDto);

      expect(result.status).toBe(400);
      expect(result.body).toEqual(expectedError);
    });

    it('Timeout', async () => {
      await delay(5000);
    });

    it('POST: shouldn`t create blog with wrong url', async () => {
      const CreateBlogDto: CreateBlogDto = {
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
        .post('/api/sa/blogs')
        .set('Authorization', basicAuthValue)
        .send(CreateBlogDto);

      expect(result.status).toBe(400);
      expect(result.body).toEqual(expectedError);
    });

    // PUT
    it('PUT: blog should be updated by correct data', async () => {
      const updateBlogModel: UpdateBlogDto = {
        name: 'Changed title',
        websiteUrl: 'https://www.google.com',
        description: 'some description',
      };

      const expectedBlog: ViewBlogDto = {
        id: expect.any(String),
        name: updateBlogModel.name,
        websiteUrl: updateBlogModel.websiteUrl,
        description: updateBlogModel.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .put(`/api/sa/blogs/${testsData.blogs[0].id}`)
        .set('Authorization', basicAuthValue)
        .send(updateBlogModel);

      expect(result.status).toBe(204);

      //const dbBlog: BlogDocument = await blogModel.findOne({ id: testsData.blogs[0].id });
      //expect(BlogMapper.toView(dbBlog)).toEqual(expectedBlog);
    });

    // PUT
    it('PUT: blog should be updated by correct data', async () => {
      const updateBlogModel: UpdateBlogDto = {
        name: 'Changed title',
        websiteUrl: 'https://www.google.com',
        description: 'some description',
      };

      const expectedBlog: ViewBlogDto = {
        id: expect.any(String),
        name: updateBlogModel.name,
        websiteUrl: updateBlogModel.websiteUrl,
        description: updateBlogModel.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .put(`/api/sa/blogs/${testsData.blogs[0].id}`)
        .set('Authorization', basicAuthValue)
        .send({ websiteUrl: 'https://www.google.com' });

      expect(result.status).toBe(400);

      // const dbBlog: BlogDocument = await blogModel.findOne({ id: testsData.blogs[0].id });
      // expect(BlogMapper.toView(dbBlog)).toEqual(expectedBlog);
    });

    it('PUT: blog shouldn`t be updated by wrong data (without wrong id)', async () => {
      const updateBlogModel: UpdateBlogDto = {
        name: 'Changed Title',
        websiteUrl: 'https://www.google.com',
        description: 'some description',
      };

      const result = await request(app.getHttpServer())
        .put('/api/sa/blogs/1111')
        .set('Authorization', basicAuthValue)
        .send(updateBlogModel);

      expect(result.status).toBe(404);
    });

    // DELETE
    it('DELETE: blog shouldn`t be deleted (wrong id)', async () => {
      const result = await request(app.getHttpServer())
        .delete('/api/sa/blogs/1111')
        .set('Authorization', basicAuthValue);

      expect(result.status).toBe(404);
    });

    it('DELETE: blog should be deleted', async () => {
      const result_1 = await request(app.getHttpServer())
        .delete(`/api/sa/blogs/${testsData.blogs[0].id}`)
        .set('Authorization', basicAuthValue)
        .expect(204);

      const result_2 = await request(app.getHttpServer())
        .delete(`/api/sa/blogs/${testsData.blogs[1].id}`)
        .set('Authorization', basicAuthValue)
        .expect(204);
    });

    it('GET: should return created blogs', async () => {
      const result = await request(app.getHttpServer()).get('/api/sa/blogs').set('Authorization', basicAuthValue);

      const expectedObj: PaginationDto<ViewBlogDto> = {
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
      const CreateBlogDto: CreateBlogDto = {
        name: 'Blog 1',
        websiteUrl: 'https://www.youtube.com',
        description: 'some description',
      };
      const expectedBlog: ViewBlogDto = {
        id: expect.any(String),
        name: CreateBlogDto.name,
        websiteUrl: CreateBlogDto.websiteUrl,
        description: CreateBlogDto.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .post('/api/sa/blogs')
        .set('Authorization', basicAuthValue)
        .send(CreateBlogDto);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedBlog);

      testsData.blogs.push(result.body);
    });

    it('POST: should create second blog', async () => {
      const CreateBlogDto: CreateBlogDto = {
        name: 'Blog 2',
        websiteUrl: 'https://www.google.com',
        description: 'some description',
      };
      const expectedBlog: ViewBlogDto = {
        id: expect.any(String),
        name: CreateBlogDto.name,
        websiteUrl: CreateBlogDto.websiteUrl,
        description: CreateBlogDto.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };

      const result = await request(app.getHttpServer())
        .post('/api/sa/blogs')
        .set('Authorization', basicAuthValue)
        .send(CreateBlogDto);

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
        .post(`/api/sa/blogs/${testsData.blogs[0].id}/posts`)
        .set('Authorization', basicAuthValue)
        .send(createPost);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedPost);

      const checkResult = await request(app.getHttpServer()).get(`/api/posts/${result.body.id}`);
      expect(checkResult.body).toEqual(expectedPost);

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
        .post(`/api/sa/blogs/${testsData.blogs[1].id}/posts`)
        .set('Authorization', basicAuthValue)
        .send(createPost);

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedPost);

      const checkResult = await request(app.getHttpServer()).get(`/api/posts/${result.body.id}`);
      expect(checkResult.body).toEqual(expectedPost);

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
        .put(`/api/sa/blogs/${testsData.blogs[0].id}/posts/${testsData.posts[0].id}`)
        .set('Authorization', basicAuthValue)
        .send(createPost);

      expect(result.status).toBe(204);

      const checkResult = await request(app.getHttpServer()).get(`/api/posts/${testsData.posts[0].id}`);
      expect(checkResult.body).toEqual(expectedPost);
    });

    it('DELETE: shouldn`t update post with wrong id', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/api/sa/blogs/${testsData.blogs[0].id}/posts/1`)
        .set('Authorization', basicAuthValue);

      expect(result.status).toBe(404);
    });

    it('DELETE: shouldn`t update post with wrong blog id', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/api/sa/blogs/1/posts/${testsData.posts[0].id}`)
        .set('Authorization', basicAuthValue);

      expect(result.status).toBe(404);
    });

    it('DELETE: should delete post in first blog', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/api/sa/blogs/${testsData.blogs[0].id}/posts/${testsData.posts[0].id}`)
        .set('Authorization', basicAuthValue);

      expect(result.status).toBe(204);

      // const dbPost: PostDocument | null = await postModel.findOne({ id: testsData.posts[0].id });
      // expect(dbPost).toBeNull();
    });

    it('DELETE: should delete post in second blog', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/api/sa/blogs/${testsData.blogs[1].id}/posts/${testsData.posts[1].id}`)
        .set('Authorization', basicAuthValue);

      expect(result.status).toBe(204);

      // const dbPost: PostDocument | null = await postModel.findOne({ id: testsData.posts[1].id });
      // expect(dbPost).toBeNull();
    });
  });

  describe.skip('Blogs Bind', () => {
    it('GET: should return array of Blogs with blogOwnerInfo', async () => {
      // const user = await userModel.create(new UserMongoEntity('aaa', 'aaa@aaa.com', 'ssss'));
      // const blog = await blogModel.create(new Blog(user.id, 'aaa', 'aaa', 'aaaa'));
      // const response = await request(app.getHttpServer()).get('/api/sa/blogs').set('Authorization', basicAuthValue);
      // expect(response.status).toBe(200);
      //
      // const expectedViewBlog: ViewExtendedBlogDto = BlogMapper.toExtendedViewFromDocument(blog, user);
      // const expectedData: PaginationDto<ViewExtendedBlogDto> = new PaginationDto<ViewExtendedBlogDto>(1, 1, 10, 1, [
      //   expectedViewBlog,
      // ]);
      // expect(response.body).toEqual(expectedData);
    });
    describe('Bind blog and user', () => {
      let user;
      let blog;

      it.skip('PUT: should bind blog with userId (if blog doesn`t have an owner) ', async () => {
        // user = await userModel.create(new UserMongoEntity('bindUser', 'bindUser@aaa.com', 'ssss'));
        // blog = await blogModel.create({
        //   id: randomUUID(),
        //   name: 'someName',
        //   websiteUrl: 'url',
        //   isMembership: false,
        //   createdAt: new Date(),
        //   description: 'descr',
        // });

        const response = await request(app.getHttpServer())
          .put(`/api/sa/blogs/${blog.id}/bind-with-user/${user.id}`)
          .set('Authorization', basicAuthValue);

        expect(response.status).toBe(204);
      });

      it('should return blog with new user info', async () => {
        const expectedViewBlog: ViewExtendedBlogDto = BlogMapper.toExtendedViewFromDocument(blog, user);
        const expectedData: PaginationDto<ViewExtendedBlogDto> = new PaginationDto<ViewExtendedBlogDto>(1, 1, 10, 1, [
          expectedViewBlog,
        ]);

        const response = await request(app.getHttpServer()).get('/api/sa/blogs').set('Authorization', basicAuthValue);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedData);
      });
    });
  });

  describe.skip('Users', () => {
    // beforeAll(async () => {
    //   await mongoConnection.db.dropDatabase();
    // });

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
    let newUser: ViewUserDto;

    it('POST: should create new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sa/users')
        .set('Authorization', basicAuthValue)
        .send(createUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expectedUser);
      newUser = response.body;
    });

    it('GET: should return created user', async () => {
      const response = await request(app.getHttpServer()).get('/api/sa/users').set('Authorization', basicAuthValue);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.totalCount).toBe(1);
      expect(response.body.items).toEqual([expectedUser]);
    });

    it('DELETE: should delete created user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/sa/users/${newUser.id}`)
        .set('Authorization', basicAuthValue);

      expect(response.status).toBe(204);
    });

    it('DELETE: shouldn`t delete user with wrong id', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/sa/users/1`)
        .set('Authorization', basicAuthValue);

      expect(response.status).toBe(404);
    });

    it('GET: should return empty list', async () => {
      const response = await request(app.getHttpServer()).get('/api/sa/users').set('Authorization', basicAuthValue);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(0);
      expect(response.body.totalCount).toBe(0);
    });

    // TODO: write tests - ban user, update (bind) blog with wrong data
  });

  describe.skip('Ban', () => {
    const banReason = 'some reason with more than 20 symbols';

    describe('SA should create users', () => {
      it('POST: should create first user', async () => {
        const createUser: CreateUserDto = {
          email: 'test1@mail.com',
          password: 'password',
          login: 'createU1',
        };

        const { response } = await UsersTestManager.createUser(app, createUser);
        testsData.users.push(Object.assign(createUser, response.body));
      });

      it('POST: should create second user', async () => {
        const createUser: CreateUserDto = {
          email: 'test2@mail.com',
          password: 'password',
          login: 'createU2',
        };

        const { response } = await UsersTestManager.createUser(app, createUser);
        testsData.users.push(Object.assign(createUser, response.body));
      });
    });

    describe('User', () => {
      describe('Prepare operations by first user', () => {
        it('POST: should login with first user', async () => {
          const loginData: LoginDto = { loginOrEmail: testsData.users[0].email, password: testsData.users[0].password };
          const expectedToken: ViewAccessTokenDto = { accessToken: expect.any(String) };
          const response = await request(app.getHttpServer()).post('/api/auth/login').send(loginData);

          expect(response.status).toBe(200);
          expect(response.body).toEqual(expectedToken);
          testsData.jwtToken = response.body.accessToken;
        });

        it('POST: should create first blog', async () => {
          const createBlogDto: CreateBlogDto = {
            name: 'Blog 1',
            websiteUrl: 'https://www.youtube.com',
            description: 'some description',
          };
          const expectedBlog: ViewBlogDto = {
            id: expect.any(String),
            name: createBlogDto.name,
            websiteUrl: createBlogDto.websiteUrl,
            description: createBlogDto.description,
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          };

          const result = await request(app.getHttpServer())
            .post('/api/sa/blogs')
            .set('Authorization', basicAuthValue)
            .send(createBlogDto);

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
            .post(`/api/sa/blogs/${testsData.blogs[0].id}/posts`)
            .set('Authorization', basicAuthValue)
            .send(createPost);

          expect(result.status).toBe(201);
          expect(result.body).toEqual(expectedPost);

          //const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
          //expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

          testsData.posts.push(result.body);
        });

        it('POST: should create comment on first post by first user', async () => {
          const сreateCommentDto: CreateCommentDto = {
            content: 'firs comment data stringstringstringst 123',
          };

          const result = await request(app.getHttpServer())
            .post(`/api/posts/${testsData.posts[0].id}/comments`)
            .set('Authorization', basicAuthValue)
            .send(сreateCommentDto)
            .expect(201);

          const expectedObj: ViewPublicCommentDto = {
            id: expect.any(String),
            content: сreateCommentDto.content,
            createdAt: expect.any(String),
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: LikeStatus.None,
            },
            commentatorInfo: {
              userId: testsData.users[0].id,
              userLogin: testsData.users[0].login,
            },
          };
          expect(result.body).toEqual(expectedObj);

          testsData.comments.push(result.body);
        });

        it('PUT: first user must like comment of first user', async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/comments/${testsData.comments[0].id}/like-status`)
            .set('Authorization', basicAuthValue)
            .send(updateLikeDto)
            .expect(204);
        });
      });

      describe('Prepare operations by second user', () => {
        it('POST: should login with second user', async () => {
          const loginData: LoginDto = {
            loginOrEmail: testsData.users[1].email,
            password: testsData.users[1].password,
          };
          const expectedToken: ViewAccessTokenDto = { accessToken: expect.any(String) };
          const response = await request(app.getHttpServer()).post('/api/auth/login').send(loginData);

          expect(response.status).toBe(200);
          expect(response.body).toEqual(expectedToken);
          testsData.jwtToken = response.body.accessToken;
        });

        it('POST: should create comment on first post by second user', async () => {
          const сreateCommentDto: CreateCommentDto = {
            content: 'firs comment data stringstringstringst 123',
          };

          const result = await request(app.getHttpServer())
            .post(`/api/posts/${testsData.posts[0].id}/comments`)
            .set('Authorization', basicAuthValue)
            .send(сreateCommentDto)
            .expect(201);

          const expectedObj: ViewPublicCommentDto = {
            id: expect.any(String),
            content: сreateCommentDto.content,
            createdAt: expect.any(String),
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: LikeStatus.None,
            },
            commentatorInfo: {
              userId: testsData.users[1].id,
              userLogin: testsData.users[1].login,
            },
          };
          expect(result.body).toEqual(expectedObj);

          testsData.comments.push(result.body);
        });

        it('PUT: second user must like post of first user', async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/posts/${testsData.posts[0].id}/like-status`)
            .set('Authorization', basicAuthValue)
            .send(updateLikeDto)
            .expect(204);
        });

        it('PUT: second user must like comment of first user', async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/comments/${testsData.comments[0].id}/like-status`)
            .set('Authorization', basicAuthValue)
            .send(updateLikeDto)
            .expect(204);
        });
      });

      describe('Get data', () => {
        // Should get users - check that users is not banned
        it('Get banned user data', async () => {
          const expectedUser: ViewUserDto = {
            id: testsData.users[1].id,
            createdAt: testsData.users[1].createdAt,
            login: testsData.users[1].login,
            email: testsData.users[1].email,
            // banInfo: {
            //   isBanned: true,
            //   banDate: expect.any(String),
            //   banReason: banReason,
            // },
          };

          const response = await request(app.getHttpServer())
            .get(`/api/sa/users?banStatus=banned`)
            .set('Authorization', basicAuthValue)
            .expect(200);

          expect(response.body.items.length).toBe(0);
        });

        // Get second user device session id from db
        it('GET: second user device sessions', async () => {
          //const dbSecurityDevice: SecurityDevice | null = await deviceModel.findOne({ userId: testsData.users[1].id });
          //expect(dbSecurityDevice).not.toBeFalsy();
        });

        // Should get first user comment on first post with correct number of likes by unauthorized
        it('GET: comment#1 of first user with 2 likes', async () => {
          const expectedCommentData: ViewPublicCommentDto = {
            ...testsData.comments[0],
            likesInfo: {
              dislikesCount: 0,
              likesCount: 2,
              myStatus: LikeStatus.None,
            },
          };

          const result = await request(app.getHttpServer())
            .get(`/api/comments/${testsData.comments[0].id}`)
            .expect(200);

          expect(result.body).toEqual(expectedCommentData);
        });

        // Should get first user post with likes and comments (get all comments)
        it('GET: post of first user with 1 like', async () => {
          const expectedObj: ViewPostDto = {
            ...testsData.posts[0],
            extendedLikesInfo: {
              dislikesCount: 0,
              likesCount: 1,
              myStatus: LikeStatus.None,
              newestLikes: [
                {
                  addedAt: expect.any(String),
                  userId: testsData.users[1].id,
                  login: testsData.users[1].login,
                },
              ],
            },
          };

          const result = await request(app.getHttpServer()).get(`/api/posts/${testsData.posts[0].id}`).expect(200);

          expect(result.body).toEqual(expectedObj);
        });

        // Should get second user comment
        it('GET: comment#2 of second user with 0 likes', async () => {
          const expectedCommentData: ViewPublicCommentDto = {
            ...testsData.comments[1],
            likesInfo: {
              dislikesCount: 0,
              likesCount: 0,
              myStatus: LikeStatus.None,
            },
          };

          const result = await request(app.getHttpServer())
            .get(`/api/comments/${testsData.comments[1].id}`)
            .expect(200);

          expect(result.body).toEqual(expectedCommentData);
        });
      });

      describe('Ban second user', () => {
        it('Shouldn`t ban user if unauthorized', async () => {
          const banUserDto: BanUserDto = {
            isBanned: true,
            banReason: banReason,
          };

          const response = await request(app.getHttpServer())
            .put(`/api/sa/users/${testsData.users[1].id}/ban`)
            .send(banUserDto)
            .expect(401);
        });

        // it('Shouldn`t ban user with wrong id', async () => {
        //   const banUserDto: BanUserDto = {
        //     isBanned: true,
        //     banReason: banReason,
        //   };
        //
        //   const response = await request(app.getHttpServer())
        //     .put(`/api/sa/users/1/ban`)
        //     .set('Authorization', basicAuthValue)
        //     .send(banUserDto)
        //     .expect(404);
        // });

        it('Should ban user', async () => {
          const banUserDto: BanUserDto = {
            isBanned: true,
            banReason: banReason,
          };

          const response = await request(app.getHttpServer())
            .put(`/api/sa/users/${testsData.users[1].id}/ban`)
            .set('Authorization', basicAuthValue)
            .send(banUserDto)
            .expect(204);
        });
      });

      describe('Check ban results', () => {
        // Should get users - check that second user is banned
        it('Get banned user data', async () => {
          const expectedUser: ViewUserDto = {
            id: testsData.users[1].id,
            createdAt: testsData.users[1].createdAt,
            login: testsData.users[1].login,
            email: testsData.users[1].email,
            // banInfo: {
            //   isBanned: true,
            //   banDate: expect.any(String),
            //   banReason: banReason,
            // },
          };

          const response = await request(app.getHttpServer())
            .get(`/api/sa/users?banStatus=banned`)
            .set('Authorization', basicAuthValue)
            .expect(200);

          expect(response.body.items[0]).toEqual(expectedUser);
        });

        // Shouldn`t get second user device session id from db
        it('GET: second user device sessions', async () => {
          //   const dbSecurityDevice: SecurityDevice | null = await deviceModel.findOne({ userId: testsData.users[1].id });
          //   expect(dbSecurityDevice).toBeFalsy();
        });

        // Second user shouldn`t login (get 401)
        it('POST: shouldn`t login with second user', async () => {
          const loginData: LoginDto = {
            loginOrEmail: testsData.users[1].email,
            password: testsData.users[1].password,
          };
          const expectedToken: ViewAccessTokenDto = { accessToken: expect.any(String) };
          const response = await request(app.getHttpServer()).post('/api/auth/login').send(loginData);

          expect(response.status).toBe(401);
        });

        // Should get first user comment on first post with correct number of likes by unauthorized (second user likes don`t be shown)
        it('GET: comment#1 of first user with 1 likes (not counted like of banned user)', async () => {
          const expectedCommentData: ViewPublicCommentDto = {
            ...testsData.comments[0],
            likesInfo: {
              dislikesCount: 0,
              likesCount: 1,
              myStatus: LikeStatus.None,
            },
          };

          const result = await request(app.getHttpServer())
            .get(`/api/comments/${testsData.comments[0].id}`)
            .expect(200);

          expect(result.body).toEqual(expectedCommentData);
        });

        // Should get first user post with likes and comments (get only comments of first user)
        it('GET: post of first user with 1 like', async () => {
          const expectedObj: ViewPostDto = {
            ...testsData.posts[0],
            extendedLikesInfo: {
              dislikesCount: 0,
              likesCount: 0,
              myStatus: LikeStatus.None,
              newestLikes: [],
            },
          };

          const result = await request(app.getHttpServer()).get(`/api/posts/${testsData.posts[0].id}`).expect(200);

          expect(result.body).toEqual(expectedObj);
        });

        // Should`nt get second user comment (get 404)
        it('GET: sholdn`t get comment#2 of banned second user', async () => {
          const result = await request(app.getHttpServer())
            .get(`/api/comments/${testsData.comments[1].id}`)
            .expect(404);
        });
      });
    });
  });
});
