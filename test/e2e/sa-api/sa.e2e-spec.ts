import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { setupApp } from '../../../src/setup-app';
import { Blog, BlogSchema } from '../../../src/modules/blog-composition/modules/blogs/schemas/blog.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Model, Connection, connect } from 'mongoose';
import { AppConfigModule } from '../../../src/config/app-config.module';
import { DbConfigService } from '../../../src/config/config-services/db-config.service';
import { User, UserSchema } from '../../../src/modules/users/repository/mongoose/schemas/user.schema';
import { BlogMapper } from '../../../src/modules/blog-composition/modules/blogs/utils/blogs.mapper';
import { PaginationDto } from '../../../src/common/dto/pagination';
import { ViewExtendedBlogDto } from '../../../src/modules/blog-composition/modules/blogs/dto/view-extended-blog.dto';
import { randomUUID } from 'crypto';
import { CreateUserDto } from '../../../src/modules/users/dto/input/create-user.dto';
import ViewUserDto from '../../../src/modules/users/dto/output/view-user.dto';
import { basicAuthValue } from '../test-helpers';
import process from 'process';
import { CreateBlogDto } from '../../../src/modules/blog-composition/modules/blogs/dto/create-blog.dto';
import { CreatePostOfBlogDto } from '../../../src/modules/blog-composition/modules/posts/dto/create-post-of-blog.dto';
import { ViewPostDto } from '../../../src/modules/blog-composition/modules/posts/dto/view-post.dto';
import {
  Post,
  PostDocument,
  PostSchema,
} from '../../../src/modules/blog-composition/modules/posts/schemas/post.schema';
import { PostsMapper } from '../../../src/modules/blog-composition/modules/posts/utils/posts.mapper';
import { Comment, CommentSchema } from '../../../src/modules/blog-composition/modules/comments/schemas/comment.schema';
import { CreateCommentDto } from '../../../src/modules/blog-composition/modules/comments/dto/create-comment.dto';
import { ViewPublicCommentDto } from '../../../src/modules/blog-composition/modules/comments/dto/view-public-comment.dto';
import { LikeStatus } from '../../../src/modules/blog-composition/modules/likes/types/like';
import { BanUserDto } from '../../../src/modules/ban/dto/input/ban-user.dto';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';
import { ViewAccessTokenDto } from '../../../src/modules/auth/dto/view-access-token.dto';
import { UpdateLikeDto } from '../../../src/modules/blog-composition/modules/likes/dto/update-like.dto';
import { ViewBlogDto } from '../../../src/modules/blog-composition/modules/blogs/dto/view-blog.dto';
import {
  SecurityDevice,
  SecurityDeviceSchema,
} from '../../../src/modules/security-devices/repository/mongoose/schemas/security-device.schema';

jest.setTimeout(100000);
const PORT = Number(process.env.PORT || 3000) + 3;

describe('Super-admin tests (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let connectionUri;
  let mongoConnection: Connection;

  const testsData = {
    jwtToken: '',
    users: [],
    blogs: [],
    posts: [],
    comments: [],
  };

  let blogModel: Model<Blog>;
  let postModel: Model<Post>;
  let userModel: Model<User>;
  let commentModel: Model<Comment>;
  let deviceModel: Model<SecurityDevice>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    connectionUri = mongod.getUri();
    mongoConnection = (await connect(connectionUri)).connection;

    blogModel = mongoConnection.model(Blog.name, BlogSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    deviceModel = mongoConnection.model(SecurityDevice.name, SecurityDeviceSchema);
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

  beforeAll(async () => {
    const response = await request(app.getHttpServer()).delete('/api/testing/all-data');
  });

  describe.skip('Blogs', () => {
    beforeAll(async () => {
      await mongoConnection.db.dropDatabase();
    });

    it('GET: should return array of Blogs with blogOwnerInfo', async () => {
      const user = await userModel.create(new User('aaa', 'aaa@aaa.com', 'ssss'));
      const blog = await blogModel.create(new Blog(user.id, 'aaa', 'aaa', 'aaaa'));

      const response = await request(app.getHttpServer()).get('/api/sa/blogs').set('Authorization', basicAuthValue);
      expect(response.status).toBe(200);

      const expectedViewBlog: ViewExtendedBlogDto = BlogMapper.toExtendedView(blog, user);
      const expectedData: PaginationDto<ViewExtendedBlogDto> = new PaginationDto<ViewExtendedBlogDto>(1, 1, 10, 1, [
        expectedViewBlog,
      ]);
      expect(response.body).toEqual(expectedData);
    });

    describe('Bind blog and user', () => {
      beforeAll(async () => {
        await mongoConnection.db.dropDatabase();
      });

      let user;
      let blog;

      it('PUT: should bind blog with userId (if blog doesn`t have an owner) ', async () => {
        user = await userModel.create(new User('bindUser', 'bindUser@aaa.com', 'ssss'));
        blog = await blogModel.create({
          id: randomUUID(),
          name: 'someName',
          websiteUrl: 'url',
          isMembership: false,
          createdAt: new Date(),
          description: 'descr',
        });

        const response = await request(app.getHttpServer())
          .put(`/api/sa/blogs/${blog.id}/bind-with-user/${user.id}`)
          .set('Authorization', basicAuthValue);

        expect(response.status).toBe(204);
      });

      it('should return blog with new user info', async () => {
        const expectedViewBlog: ViewExtendedBlogDto = BlogMapper.toExtendedView(blog, user);
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
    beforeAll(async () => {
      await mongoConnection.db.dropDatabase();
    });

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

  describe('Ban', () => {
    const banReason = 'some reason with more than 20 symbols';

    describe('SA should create users', () => {
      it('POST: should create first user', async () => {
        const createUser: CreateUserDto = {
          email: 'test1@mail.com',
          password: 'password',
          login: 'createU1',
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

        const response = await request(app.getHttpServer())
          .post('/api/sa/users')
          .set('Authorization', basicAuthValue)
          .send(createUser);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(expectedUser);

        testsData.users.push(Object.assign(createUser, response.body));
      });

      it('POST: should create second user', async () => {
        const createUser: CreateUserDto = {
          email: 'test2@mail.com',
          password: 'password',
          login: 'createU2',
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

        const response = await request(app.getHttpServer())
          .post('/api/sa/users')
          .set('Authorization', basicAuthValue)
          .send(createUser);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(expectedUser);

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
            .post('/api/blogger/blogs')
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
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
            .post(`/api/blogger/blogs/${testsData.blogs[0].id}/posts`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(createPost);

          expect(result.status).toBe(201);
          expect(result.body).toEqual(expectedPost);

          const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
          expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

          testsData.posts.push(result.body);
        });

        it('POST: should create comment on first post by first user', async () => {
          const сreateCommentDto: CreateCommentDto = {
            content: 'firs comment data stringstringstringst 123',
          };

          const result = await request(app.getHttpServer())
            .post(`/api/posts/${testsData.posts[0].id}/comments`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
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
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
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
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
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
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(updateLikeDto)
            .expect(204);
        });

        it('PUT: second user must like comment of first user', async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/comments/${testsData.comments[0].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
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
          const dbSecurityDevice: SecurityDevice | null = await deviceModel.findOne({ userId: testsData.users[1].id });

          expect(dbSecurityDevice).not.toBeFalsy();
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

        // Should`nt get second user device session id from db
        it('GET: second user device sessions', async () => {
          const dbSecurityDevice: SecurityDevice | null = await deviceModel.findOne({ userId: testsData.users[1].id });

          expect(dbSecurityDevice).toBeFalsy();
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
