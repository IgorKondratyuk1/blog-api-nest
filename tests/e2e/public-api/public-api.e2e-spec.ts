import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { setupApp } from '../../../src/setup-app';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';
import { ViewAccessTokenDto } from '../../../src/modules/auth/dto/view-access-token.dto';
import { CreateBlogDto } from '../../../src/modules/blog-composition/modules/blogs/models/input/create-blog.dto';
import { CreatePostOfBlogDto } from '../../../src/modules/blog-composition/modules/posts/dto/create-post-of-blog.dto';
import { ViewPostDto } from '../../../src/modules/blog-composition/modules/posts/dto/view-post.dto';
import { LikeStatus } from '../../../src/modules/blog-composition/modules/likes/types/like';
import { CreateCommentDto } from '../../../src/modules/blog-composition/modules/comments/dto/create-comment.dto';
import { ViewPublicCommentDto } from '../../../src/modules/blog-composition/modules/comments/dto/view-public-comment.dto';
import { CreateUserDto } from '../../../src/modules/users/models/input/create-user.dto';
import { UpdateCommentDto } from '../../../src/modules/blog-composition/modules/comments/dto/update-comment.dto';
import { UpdateLikeDto } from '../../../src/modules/blog-composition/modules/likes/dto/update-like.dto';
import process from 'process';
import { basicAuthValue } from '../utils/helpers';

jest.setTimeout(100000);
const PORT = Number(process.env.PORT || 3000) + 2;

describe('Public (e2e)', () => {
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
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.listen(PORT);
    //console.log('\u001b[36m' + `Tests is running on: ${connectionUri}` + '\x1b[0m');
  });

  afterAll(() => {
    app.close();
  });

  beforeAll(async () => {
    const response = await request(app.getHttpServer()).delete('/api/testing/all-data');
  });

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
        // banInfo: {
        //   isBanned: false,
        //   banReason: null,
        //   banDate: null,
        // },
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
        // banInfo: {
        //   isBanned: false,
        //   banReason: null,
        //   banDate: null,
        // },
      };

      const response = await request(app.getHttpServer())
        .post('/api/sa/users')
        .set('Authorization', basicAuthValue)
        .send(createUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expectedUser);

      testsData.users.push(Object.assign(createUser, response.body));
    });

    it('POST: should login with first user', async () => {
      const loginData: LoginDto = { loginOrEmail: testsData.users[0].email, password: testsData.users[0].password };
      const expectedToken: ViewAccessTokenDto = { accessToken: expect.any(String) };
      const response = await request(app.getHttpServer()).post('/api/auth/login').send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedToken);
      testsData.jwtToken = response.body.accessToken;
    });
  });

  describe.skip('Comments', () => {
    describe('Prepare operations', () => {
      it('POST: should create first blog', async () => {
        console.log(testsData.users[0]);
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

        // const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
        // expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

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

        // const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
        // expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

        testsData.posts.push(result.body);
      });
    });

    describe('Create and Read operations', () => {
      it('POST: should create comment with correct data', async () => {
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

      it('POST: shouldn`t create comment with incorrect data', async () => {
        const сreateCommentDto: CreateCommentDto = {
          content: '1',
        };

        const result = await request(app.getHttpServer())
          .post(`/api/posts/${testsData.posts[0].id}/comments`)
          .set('Authorization', `Bearer ${testsData.jwtToken}`)
          .send(сreateCommentDto)
          .expect(400);

        expect(result.body).toEqual({
          errorsMessages: [
            {
              message: expect.any(String),
              field: 'content',
            },
          ],
        });
      });

      it('POST: shouldn`t create comment with incorrect post id', async () => {
        const сreateCommentDto: CreateCommentDto = {
          content: 'firs comment data stringstringstringst',
        };

        const result = await request(app.getHttpServer())
          .post(`/api/posts/1/comments`)
          .set('Authorization', `Bearer ${testsData.jwtToken}`)
          .send(сreateCommentDto)
          .expect(404);
      });

      it('GET: should return 1 element. Checking that wrong comments is not created', async () => {
        const result = await request(app.getHttpServer())
          .get(`/api/posts/${testsData.posts[0].id}/comments`)
          .set('Authorization', `Bearer ${testsData.jwtToken}`)
          .expect(200);

        expect(result.body.items.length).toBe(1);
        expect(result.body.items[0]).toEqual(testsData.comments[0]);
      });

      it('POST: shouldn`t create post without Authorization header JWT', async () => {
        const сreateCommentDto: CreateCommentDto = {
          content: 'firs comment data stringstringstringst',
        };

        const result = await request(app.getHttpServer())
          .post(`/api/posts/${testsData.posts[0].id}/comments`)
          .send(сreateCommentDto)
          .expect(401);
      });
    });

    describe('Update operations', () => {
      // --------- Prepare data ---------
      it('POST: should login with second user', async () => {
        const loginData: LoginDto = { loginOrEmail: testsData.users[1].email, password: testsData.users[1].password };
        const expectedToken: ViewAccessTokenDto = { accessToken: expect.any(String) };
        const response = await request(app.getHttpServer()).post('/api/auth/login').send(loginData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedToken);
        testsData.jwtToken = response.body.accessToken;
      });

      // --------- PUT: Testing forbidden update ---------
      it('PUT: shouldn`t update comment of other user', async () => {
        console.log(testsData.comments);
        const updateCommentDto: UpdateCommentDto = {
          content: 'Content updated by 2-nd user str str str str',
        };

        const result = await request(app.getHttpServer())
          .put(`/api/comments/${testsData.comments[0].id}`)
          .set('Authorization', `Bearer ${testsData.jwtToken}`)
          .send(updateCommentDto)
          .expect(403);
      });

      // Checking
      it('GET: should return same first comment #1', async () => {
        const result = await request(app.getHttpServer())
          .get(`/api/comments/${testsData.comments[0].id}`)
          .set('Authorization', `Bearer ${testsData.jwtToken}`)
          .expect(200);

        expect(result.body).toEqual(testsData.comments[0]);
      });

      // --------- PUT: Testing forbidden delete ---------
      it('DELETE: should delete comment', async () => {
        const result = await request(app.getHttpServer())
          .delete(`/api/comments/${testsData.comments[0].id}`)
          .set('Authorization', `Bearer ${testsData.jwtToken}`)
          .expect(403);
      });

      // Checking
      it('GET: should return same first comment #2', async () => {
        const result = await request(app.getHttpServer())
          .get(`/api/comments/${testsData.comments[0].id}`)
          .set('Authorization', `Bearer ${testsData.jwtToken}`)
          .expect(200);

        expect(result.body).toEqual(testsData.comments[0]);
      });
    });

    describe('Testing deleting of comments', () => {
      // --------- Prepare data ---------
      it('POST: should login with first user', async () => {
        const loginData: LoginDto = { loginOrEmail: testsData.users[0].email, password: testsData.users[0].password };
        const expectedToken: ViewAccessTokenDto = { accessToken: expect.any(String) };
        const response = await request(app.getHttpServer()).post('/api/auth/login').send(loginData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedToken);
        testsData.jwtToken = response.body.accessToken;
      });

      it('DELETE: shouldn`t delete comment with wrong id', async () => {
        const result = await request(app.getHttpServer())
          .delete(`/api/comments/1`)
          .set('Authorization', `Bearer ${testsData.jwtToken}`)
          .expect(404);
      });

      it('DELETE: shouldn`t delete comment without jwt token', async () => {
        const result = await request(app.getHttpServer())
          .delete(`/api/comments/${testsData.comments[0].id}`)
          .expect(401);
      });

      it('DELETE: should delete comment', async () => {
        const result = await request(app.getHttpServer())
          .delete(`/api/comments/${testsData.comments[0].id}`)
          .set('Authorization', `Bearer ${testsData.jwtToken}`)
          .expect(204);
      });

      // Check that arr is empty
      it('GET: should return empty array of comments', async () => {
        const result = await request(app.getHttpServer())
          .get(`/api/posts/${testsData.posts[0].id}/comments`)
          .set('Authorization', `Bearer ${testsData.jwtToken}`)
          .expect(200);

        expect(result.body.items).toEqual([]);
      });
    });
  });

  describe('Likes', () => {
    describe.skip('Comments Likes', () => {
      beforeAll(() => {
        testsData.blogs = [];
        testsData.posts = [];
        testsData.comments = [];
      });

      describe('Prepare operations', () => {
        it('POST: should create first blog', async () => {
          console.log(testsData.users[0]);
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

          // const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
          // expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

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

          // const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
          // expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

          testsData.posts.push(result.body);
        });

        it('POST: should create comment to first post', async () => {
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
      });

      describe('Put "Like" to comment', () => {
        it("PUT: shouldn`t put 'Like' to comment from unauthorized user", async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/comments/${testsData.comments[0].id}/like-status`)
            .send(updateLikeDto)
            .expect(401);
        });

        it('GET: comment must not have changed', async () => {
          const result = await request(app.getHttpServer())
            .get(`/api/comments/${testsData.comments[0].id}`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .expect(200);

          expect(result.body).toEqual(testsData.comments[0]);
        });

        it("PUT: should put 'Like' to comment", async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/comments/${testsData.comments[0].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(updateLikeDto)
            .expect(204);
        });

        it("GET: comment must have likes:1 and myStatus:'Like' when author of like getting comment", async () => {
          const expectedCommentData: ViewPublicCommentDto = {
            ...testsData.comments[0],
            likesInfo: {
              dislikesCount: 0,
              likesCount: 1,
              myStatus: LikeStatus.Like,
            },
          };

          const result = await request(app.getHttpServer())
            .get(`/api/comments/${testsData.comments[0].id}`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .expect(200);

          expect(result.body).toEqual(expectedCommentData);
        });

        it("GET: comment must have likes:1 and myStatus:'None' when unknown user getting comment", async () => {
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
      });

      describe('Put "Dislike" to comment', () => {
        it("PUT: should put 'Dislike' to comment", async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Dislike,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/comments/${testsData.comments[0].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(updateLikeDto)
            .expect(204);
        });

        it("GET: comment must have likes:0, dislikes:1 and myStatus:'Dislike' when author of like getting comment", async () => {
          const expectedCommentData: ViewCommentModel = {
            ...testsData.comments[0],
            likesInfo: {
              dislikesCount: 1,
              likesCount: 0,
              myStatus: LikeStatus.Dislike,
            },
          };

          const result = await request(app.getHttpServer())
            .get(`/api/comments/${testsData.comments[0].id}`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .expect(200);

          expect(result.body).toEqual(expectedCommentData);
        });

        it("GET: comment must have likes:0, dislikes:1 and myStatus:'None' when unknown user getting comment", async () => {
          const expectedCommentData: ViewCommentModel = {
            ...testsData.comments[0],
            likesInfo: {
              dislikesCount: 1,
              likesCount: 0,
              myStatus: LikeStatus.None,
            },
          };

          const result = await request(app.getHttpServer())
            .get(`/api/comments/${testsData.comments[0].id}`)
            .expect(200);

          expect(result.body).toEqual(expectedCommentData);
        });
      });

      describe('Put "None" to comment', () => {
        it("PUT: should put 'None' to comment", async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.None,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/comments/${testsData.comments[0].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(updateLikeDto)
            .expect(204);
        });

        it("GET: comment must have likes:0, dislikes:0 and myStatus:'None' when author of like getting comment", async () => {
          const expectedCommentData: ViewCommentModel = {
            ...testsData.comments[0],
            likesInfo: {
              dislikesCount: 0,
              likesCount: 0,
              myStatus: LikeStatus.None,
            },
          };

          const result = await request(app.getHttpServer())
            .get(`/api/comments/${testsData.comments[0].id}`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .expect(200);

          expect(result.body).toEqual(expectedCommentData);
        });
      });

      describe('Delete comment', () => {
        it('DELETE: should delete comment', async () => {
          const result = await request(app.getHttpServer())
            .delete(`/api/comments/${testsData.comments[0].id}`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .expect(204);
        });

        // Put "Like" to comment
        it("PUT: shouldn`t put 'Like' to comment", async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/comments/${testsData.comments[0].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(updateLikeDto)
            .expect(404);
        });
      });
    });

    describe('Posts Likes', () => {
      beforeAll(() => {
        testsData.blogs = [];
        testsData.posts = [];
        testsData.comments = [];
      });

      it.skip('Timeout', async () => {
        await delay(5000);
      });

      describe('Prepare operations', () => {
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

          // const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
          // expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

          testsData.posts.push(result.body);
        });

        it('POST: should create first post in second blog', async () => {
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

          // const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
          // expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

          testsData.posts.push(result.body);
        });

        it('POST: should create second post in second blog', async () => {
          const createPost: CreatePostOfBlogDto = {
            title: 'Post 2 of Blog 2',
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

          // const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
          // expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

          testsData.posts.push(result.body);
        });

        it('POST: should create third post in second blog', async () => {
          const createPost: CreatePostOfBlogDto = {
            title: 'Post 3 of Blog 2',
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

          // const dbPost: PostDocument = await postModel.findOne({ id: result.body.id });
          // expect(PostsMapper.toView(dbPost)).toEqual(expectedPost);

          testsData.posts.push(result.body);
        });
      });

      describe('Put "Like" to post', () => {
        // Put "Like" to post
        it("PUT: shouldn`t put 'Like' to post from unauthorized user", async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/posts/${testsData.posts[0].id}/like-status`)
            .send(updateLikeDto)
            .expect(401);
        });

        it('GET: post must not have changed', async () => {
          const result = await request(app.getHttpServer())
            .get(`/api/posts/${testsData.posts[0].id}`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .expect(200);

          expect(result.body).toEqual(testsData.posts[0]);
        });

        // Put "Like" to post
        it("PUT: should put 'Like' to post", async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/posts/${testsData.posts[0].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(updateLikeDto)
            .expect(204);
        });

        it("GET: post must have likes:1 and myStatus:'Like' and Newestlikes when author of like getting post", async () => {
          const expectedObj: ViewPostDto = {
            ...testsData.posts[0],
            extendedLikesInfo: {
              dislikesCount: 0,
              likesCount: 1,
              myStatus: LikeStatus.Like,
              newestLikes: [
                {
                  addedAt: expect.any(String),
                  userId: testsData.users[0].id,
                  login: testsData.users[0].login,
                },
              ],
            },
          };

          const result = await request(app.getHttpServer())
            .get(`/api/posts/${testsData.posts[0].id}`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .expect(200);

          expect(result.body).toEqual(expectedObj);
        });

        //Put "Like" to post second time
        it("PUT: shouldn`t put 'Like' to post twice", async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/posts/${testsData.posts[0].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(updateLikeDto)
            .expect(204);
        });

        it("GET: post must have likes:1 and myStatus:'Like' and Newestlikes without changes", async () => {
          const expectedObj: ViewPostDto = {
            ...testsData.posts[0],
            extendedLikesInfo: {
              dislikesCount: 0,
              likesCount: 1,
              myStatus: LikeStatus.Like,
              newestLikes: [
                {
                  addedAt: expect.any(String),
                  userId: testsData.users[0].id,
                  login: testsData.users[0].login,
                },
              ],
            },
          };

          const result = await request(app.getHttpServer())
            .get(`/api/posts/${testsData.posts[0].id}`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .expect(200);

          expect(result.body).toEqual(expectedObj);
        });

        it("GET: post must have likes:1 and myStatus:'None' and Newestlikes when unknown user getting post", async () => {
          const expectedObj: ViewPostDto = {
            ...testsData.posts[0],
            extendedLikesInfo: {
              dislikesCount: 0,
              likesCount: 1,
              myStatus: LikeStatus.None,
              newestLikes: [
                {
                  addedAt: expect.any(String),
                  userId: testsData.users[0].id,
                  login: testsData.users[0].login,
                },
              ],
            },
          };

          const result = await request(app.getHttpServer()).get(`/api/posts/${testsData.posts[0].id}`).expect(200);

          expect(result.body).toEqual(expectedObj);
        });
      });

      describe('Put "None" to post', () => {
        it("PUT: should put 'None' to post", async () => {
          const updateLikeDto: UpdateLikeDto = {
            likeStatus: LikeStatus.None,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/posts/${testsData.posts[0].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(updateLikeDto)
            .expect(204);
        });

        it("GET: post must have likes:0 and myStatus:'None' and no Newestlikes when author of like getting post", async () => {
          const expectedObj: ViewCommentModel = {
            ...testsData.posts[0],
            extendedLikesInfo: {
              dislikesCount: 0,
              likesCount: 0,
              myStatus: LikeStatus.None,
              newestLikes: [],
            },
          };

          const result = await request(app.getHttpServer())
            .get(`/api/posts/${testsData.posts[0].id}`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .expect(200);

          expect(result.body).toEqual(expectedObj);
        });
      });

      describe('Other likes actions', () => {
        // Put "Like" to first post by first UserEntity
        it("PUT: should put 'Like' to first post of second blog by first UserEntity", async () => {
          const data: UpdateLikeModel = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/posts/${testsData.posts[1].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(data)
            .expect(204);
        });

        // Put "Dislike" to second post by first UserEntity
        it("PUT: should put 'Dislike' to second post of second blog by first UserEntity", async () => {
          const data: UpdateLikeModel = {
            likeStatus: LikeStatus.Dislike,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/posts/${testsData.posts[2].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(data)
            .expect(204);
        });

        // Put "Like" to third post by first UserEntity
        it("PUT: should put 'Like' to third post of second blog by first UserEntity", async () => {
          const data: UpdateLikeModel = {
            likeStatus: LikeStatus.Like,
          };

          const result = await request(app.getHttpServer())
            .put(`/api/posts/${testsData.posts[2].id}/like-status`)
            .set('Authorization', `Bearer ${testsData.jwtToken}`)
            .send(data)
            .expect(204);
        });
      });
    });
  });

  // TODO write tests:
  //  1. Likes
  //  2. SecurityDevices,
  //  3. Delete All Data,
});
