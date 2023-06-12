import request from 'supertest';
import { basicAuthValue, usersPassword } from './users.e2e-spec';
import { CreateUserModel } from '../models/user/createUserModel';
import { ViewUserModel } from '../models/user/viewUserModel';
import { LoginInputModel } from '../models/auth/login/loginInputModel';
import { ViewBlogModel } from '../models/blog/viewBlogModel';
import { CreatePostModel } from '../models/post/createPostModel';
import { ViewPostModel } from '../models/post/viewPostModel';
import { CreateCommentModel } from '../models/comment/createCommentModel';
import { ViewCommentModel } from '../models/comment/viewCommentModel';
import { LikeStatus } from '../../../src/modules/blog-composition/modules/likes/types/like';
import { UpdateLikeModel } from '../models/like/updateLikeModel';
import { CreateBlogModel } from '../models/blog/createBlogModel';

// Testing: Comments Likes
describe('/comments/like-status', () => {
  let jwtToken = '';
  let firstComment: any = null;
  let firstUser: any = null;
  let secondUser: any = null;
  const baseUrl = 'http://localhost:3000/api';

  beforeAll(async () => {
    await request(baseUrl).delete('/testing/all-data').set('Authorization', basicAuthValue);
    console.log('Database is empty');
  });

  // --------- Prepare Data ---------
  // Create first User
  it('POST: should create first user', async () => {
    const data: CreateUserModel = {
      email: 'testUser1@gmail.com',
      login: 'test1',
      password: usersPassword,
    };

    const result = await request(baseUrl).post('/users').set('Authorization', basicAuthValue).send(data);

    firstUser = result.body;

    expect(result.status).toBe(201);
    const expectedObj: ViewUserModel = {
      id: expect.any(String),
      login: data.login,
      email: data.email,
      createdAt: expect.any(String),
    };
    expect(result.body).toEqual(expectedObj);
  });

  // Create second User
  it('POST: should create second user', async () => {
    const data: CreateUserModel = {
      email: 'testUser2@gmail.com',
      login: 'test2',
      password: usersPassword,
    };

    const result = await request(baseUrl).post('/users').set('Authorization', basicAuthValue).send(data);

    secondUser = result.body;

    expect(result.status).toBe(201);
    const expectedObj: ViewUserModel = {
      id: expect.any(String),
      login: data.login,
      email: data.email,
      createdAt: expect.any(String),
    };
    expect(result.body).toEqual(expectedObj);
  });

  it('POST: should login using first User', async () => {
    const data: LoginInputModel = {
      loginOrEmail: firstUser.login,
      password: usersPassword,
    };

    const result = await request(baseUrl)
      .post('/auth/login')
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(200);

    expect(result.body).toEqual({
      accessToken: expect.any(String),
    });

    jwtToken = result.body.accessToken;
  });

  it('GET: check current (firstUser) user data', async () => {
    const result = await request(baseUrl).get('/auth/me').set('Authorization', `Bearer ${jwtToken}`).expect(200);

    expect(result.body).toEqual({
      email: firstUser.email,
      login: firstUser.login,
      userId: expect.any(String),
    });
  });

  // Create Blog
  let firstBlog: any = null;
  it('POST: should create blog', async () => {
    const data: CreateBlogModel = {
      name: 'New Blog',
      websiteUrl: 'https://www.youtube.com',
      description: 'some description',
    };

    const result = await request(baseUrl).post('/blogs').set('Authorization', basicAuthValue).send(data);

    firstBlog = result.body;

    expect(result.status).toBe(201);
    const expectedObj: ViewBlogModel = {
      id: expect.any(String),
      name: data.name,
      websiteUrl: data.websiteUrl,
      description: data.description,
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    };
    expect(result.body).toEqual(expectedObj);
  });

  // Create Post
  let firstPost: any = null;
  it('POST: should create post with correct data', async () => {
    const data: CreatePostModel = {
      title: 'Correct title',
      shortDescription: 'descr',
      content: 'content',
      blogId: firstBlog.id,
    };

    const result = await request(baseUrl).post('/posts').set('Authorization', basicAuthValue).send(data);

    firstPost = result.body;

    const expectedObj: ViewPostModel = {
      id: expect.any(String),
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      blogId: data.blogId,
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    };
    expect(result.status).toBe(201);
    expect(firstPost).toEqual(expectedObj);
  });

  // Create first comment
  it('POST: should create comment with correct data', async () => {
    const data: CreateCommentModel = {
      content: 'firs comment data stringstringstringst',
    };

    const result = await request(baseUrl)
      .post(`/posts/${firstPost.id}/comments`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(201);

    firstComment = result.body;

    const expectedObj: ViewCommentModel = {
      id: expect.any(String),
      commentatorInfo: {
        userId: firstUser.id,
        userLogin: firstUser.login,
      },
      content: data.content,
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    };
    expect(firstComment).toEqual(expectedObj);
  });

  // Checking that new post have one comment
  it('GET: should return 1 element. Checking that wrong comments is not created', async () => {
    const result = await request(baseUrl).get(`/posts/${firstPost.id}/comments`).expect(200);

    expect(result.body.items.length).toBe(1);
    expect(result.body.items[0]).toEqual(firstComment);
  });

  // Put "Like" to comment
  it("PUT: shouldn`t put 'Like' to comment from unauthorized user", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl).put(`/comments/${firstComment.id}/like-status`).send(data).expect(401);
  });

  it('GET: comment must not have changed', async () => {
    const result = await request(baseUrl)
      .get(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual(firstComment);
  });

  // Put "Like" to comment
  it("PUT: should put 'Like' to comment", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/comments/${firstComment.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: comment must have likes:1 and myStatus:'Like' when author of like getting comment", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 0,
        likesCount: 1,
        myStatus: LikeStatus.Like,
      },
    };

    const result = await request(baseUrl)
      .get(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  it("GET: comment must have likes:1 and myStatus:'None' when unknown user getting comment", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 0,
        likesCount: 1,
        myStatus: LikeStatus.None,
      },
    };

    const result = await request(baseUrl).get(`/comments/${firstComment.id}`).expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  // Put "Dislike" to comment
  it("PUT: should put 'Dislike' to comment", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Dislike,
    };

    await request(baseUrl)
      .put(`/comments/${firstComment.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: comment must have likes:0, dislikes:1 and myStatus:'Dislike' when author of like getting comment", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 1,
        likesCount: 0,
        myStatus: LikeStatus.Dislike,
      },
    };

    const result = await request(baseUrl)
      .get(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  it("GET: comment must have likes:0, dislikes:1 and myStatus:'None' when unknown user getting comment", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 1,
        likesCount: 0,
        myStatus: LikeStatus.None,
      },
    };

    const result = await request(baseUrl).get(`/comments/${firstComment.id}`).expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  // Put "None" to comment
  it("PUT: should put 'None' to comment", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.None,
    };

    await request(baseUrl)
      .put(`/comments/${firstComment.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: comment must have likes:0, dislikes:0 and myStatus:'None' when author of like getting comment", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: LikeStatus.None,
      },
    };

    const result = await request(baseUrl)
      .get(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  // Put "Like" to comment
  it("PUT: should put 'Like' to comment again", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/comments/${firstComment.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: comment must have likes:1 and myStatus:'Like' when author of like getting comment again", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 0,
        likesCount: 1,
        myStatus: LikeStatus.Like,
      },
    };

    const result = await request(baseUrl)
      .get(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  // Second user actions with like
  it('POST: should login using second User', async () => {
    const data: LoginInputModel = {
      loginOrEmail: secondUser.login,
      password: usersPassword,
    };

    const result = await request(baseUrl)
      .post('/auth/login')
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(200);

    expect(result.body).toEqual({
      accessToken: expect.any(String),
    });

    jwtToken = result.body.accessToken;
  });

  it('GET: check current (secondUser) user data', async () => {
    const result = await request(baseUrl).get('/auth/me').set('Authorization', `Bearer ${jwtToken}`).expect(200);

    expect(result.body).toEqual({
      email: secondUser.email,
      login: secondUser.login,
      userId: expect.any(String),
    });
  });

  // Put "Like" to comment
  it("PUT: should put 'Like' to comment", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/comments/${firstComment.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: comment must have likes:2 and myStatus:'Like' when second author of like getting comment", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 0,
        likesCount: 2,
        myStatus: LikeStatus.Like,
      },
    };

    const result = await request(baseUrl)
      .get(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  it("GET: comment must have likes:2 and myStatus:'None' when unknown user getting comment", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 0,
        likesCount: 2,
        myStatus: LikeStatus.None,
      },
    };

    const result = await request(baseUrl).get(`/comments/${firstComment.id}`).expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  // Put "Dislike" to comment
  it("PUT: should put 'Dislike' to comment", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Dislike,
    };

    await request(baseUrl)
      .put(`/comments/${firstComment.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: comment must have likes:1, dislikes:1 and myStatus:'Dislike' when author of like getting comment", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 1,
        likesCount: 1,
        myStatus: LikeStatus.Dislike,
      },
    };

    const result = await request(baseUrl)
      .get(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  it("GET: comment must have likes:1, dislikes:1 and myStatus:'None' when unknown user getting comment", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 1,
        likesCount: 1,
        myStatus: LikeStatus.None,
      },
    };

    const result = await request(baseUrl).get(`/comments/${firstComment.id}`).expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  // Put "None" to comment
  it("PUT: should put 'None' to comment", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.None,
    };

    await request(baseUrl)
      .put(`/comments/${firstComment.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: comment must have likes:1, dislikes:0 and myStatus:'None' when author of like getting comment", async () => {
    const expectedCommentData: ViewCommentModel = {
      ...firstComment,
      likesInfo: {
        dislikesCount: 0,
        likesCount: 1,
        myStatus: LikeStatus.None,
      },
    };

    const result = await request(baseUrl)
      .get(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual(expectedCommentData);
  });

  // Delete comment
  it('POST: should login using first User', async () => {
    const data: LoginInputModel = {
      loginOrEmail: firstUser.login,
      password: usersPassword,
    };

    const result = await request(baseUrl)
      .post('/auth/login')
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(200);

    expect(result.body).toEqual({
      accessToken: expect.any(String),
    });

    jwtToken = result.body.accessToken;
  });

  it('DELETE: should delete comment', async () => {
    await request(baseUrl)
      .delete(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);
  });

  // Put "Like" to comment
  it("PUT: shouldn`t put 'Like' to deleted comment", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/comments/${firstComment.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(404);
  });
});

// Testing: Comments Likes
describe('/posts/like-status', () => {
  let jwtToken = '';

  let firstUser: any = null;
  let secondUser: any = null;
  let thirdUser: any = null;

  let firstBlog: any = null;
  let secondBlog: any = null;

  let firstPostOfFirstBlog: any = null;
  let firstPostOfSecondBlog: any = null;
  let secondPostOfSecondBlog: any = null;
  let thirdPostOfSecondBlog: any = null;

  const baseUrl = 'http://localhost:3000/api';

  beforeAll(async () => {
    await request(baseUrl).delete('/testing/all-data').set('Authorization', basicAuthValue);
    console.log('Database is empty');
  });

  // --------- Prepare Data ---------
  // Create first User
  it('POST: should create first user', async () => {
    const data: CreateUserModel = {
      email: 'testUser1@gmail.com',
      login: 'test1',
      password: usersPassword,
    };

    const result = await request(baseUrl).post('/users').set('Authorization', basicAuthValue).send(data);

    firstUser = result.body;

    expect(result.status).toBe(201);
    const expectedObj: ViewUserModel = {
      id: expect.any(String),
      login: data.login,
      email: data.email,
      createdAt: expect.any(String),
    };
    expect(result.body).toEqual(expectedObj);
  });

  // Create second User
  it('POST: should create second user', async () => {
    const data: CreateUserModel = {
      email: 'testUser2@gmail.com',
      login: 'test2',
      password: usersPassword,
    };

    const result = await request(baseUrl).post('/users').set('Authorization', basicAuthValue).send(data);

    secondUser = result.body;

    expect(result.status).toBe(201);
    const expectedObj: ViewUserModel = {
      id: expect.any(String),
      login: data.login,
      email: data.email,
      createdAt: expect.any(String),
    };
    expect(result.body).toEqual(expectedObj);
  });

  // Create third User
  it('POST: should create third user', async () => {
    const data: CreateUserModel = {
      email: 'testUser3@gmail.com',
      login: 'test3',
      password: usersPassword,
    };

    const result = await request(baseUrl).post('/users').set('Authorization', basicAuthValue).send(data);

    thirdUser = result.body;

    expect(result.status).toBe(201);
    const expectedObj: ViewUserModel = {
      id: expect.any(String),
      login: data.login,
      email: data.email,
      createdAt: expect.any(String),
    };
    expect(result.body).toEqual(expectedObj);
  });

  it('POST: should login using first user', async () => {
    const data: LoginInputModel = {
      loginOrEmail: firstUser.login,
      password: usersPassword,
    };

    const result = await request(baseUrl)
      .post('/auth/login')
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(200);

    expect(result.body).toEqual({
      accessToken: expect.any(String),
    });

    jwtToken = result.body.accessToken;
  });

  // Create first Blog
  it('POST: first user should create first blog', async () => {
    const data: CreateBlogModel = {
      name: 'New Blog 1',
      websiteUrl: 'https://www.youtube.com',
      description: 'some description',
    };

    const result = await request(baseUrl).post('/blogs').set('Authorization', basicAuthValue).send(data);

    firstBlog = result.body;

    expect(result.status).toBe(201);
    const expectedObj: ViewBlogModel = {
      id: expect.any(String),
      name: data.name,
      websiteUrl: data.websiteUrl,
      description: data.description,
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    };
    expect(result.body).toEqual(expectedObj);
  });

  // Create Post
  it('POST: first user should create first post of first blog', async () => {
    const data: CreatePostModel = {
      title: 'Correct title',
      shortDescription: 'descr',
      content: 'content',
      blogId: firstBlog.id,
    };

    const result = await request(baseUrl).post('/posts').set('Authorization', basicAuthValue).send(data);

    firstPostOfFirstBlog = result.body;

    const expectedObj: ViewPostModel = {
      id: expect.any(String),
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      blogId: data.blogId,
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    };
    expect(result.status).toBe(201);
    expect(firstPostOfFirstBlog).toEqual(expectedObj);
    expect(firstPostOfFirstBlog.extendedLikesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    });
  });

  // Put "Like" to post
  it("PUT: shouldn`t put 'Like' to post from unauthorized user", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl).put(`/posts/${firstPostOfFirstBlog.id}/like-status`).send(data).expect(401);
  });

  it('GET: post must not have changed', async () => {
    const result = await request(baseUrl).get(`/posts`).set('Authorization', `Bearer ${jwtToken}`).expect(200);

    expect(result.body.items.length).toBe(1);
    expect(result.body.items[0]).toEqual(firstPostOfFirstBlog);
  });

  // Put "Like" to post
  it("PUT: should put 'Like' to post", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/posts/${firstPostOfFirstBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: post must have likes:1 and myStatus:'Like' and Newestlikes when author of like getting post", async () => {
    const expectedObj: ViewCommentModel = {
      ...firstPostOfFirstBlog,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 1,
        myStatus: LikeStatus.Like,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: firstUser.id,
            login: firstUser.login,
          },
        ],
      },
    };

    const result = await request(baseUrl)
      .get(`/posts/${firstPostOfFirstBlog.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual(expectedObj);
  });

  // Put "Like" to post second time
  it("PUT: shouldn`t put 'Like' to post twice", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/posts/${firstPostOfFirstBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: post must have likes:1 and myStatus:'Like' and Newestlikes without changes", async () => {
    const expectedObj: ViewCommentModel = {
      ...firstPostOfFirstBlog,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 1,
        myStatus: LikeStatus.Like,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: firstUser.id,
            login: firstUser.login,
          },
        ],
      },
    };

    const result = await request(baseUrl)
      .get(`/posts/${firstPostOfFirstBlog.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual(expectedObj);
  });

  it("GET: post must have likes:1 and myStatus:'None' and Newestlikes when unknown user getting post", async () => {
    const expectedObj: ViewCommentModel = {
      ...firstPostOfFirstBlog,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 1,
        myStatus: LikeStatus.None,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: firstUser.id,
            login: firstUser.login,
          },
        ],
      },
    };

    const result = await request(baseUrl).get(`/posts/${firstPostOfFirstBlog.id}`).expect(200);

    expect(result.body).toEqual(expectedObj);
  });

  // Put "Dislike" to post
  it("PUT: should put 'Dislike' to post", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Dislike,
    };

    await request(baseUrl)
      .put(`/posts/${firstPostOfFirstBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: post must have likes:1 and myStatus:'Dislike' and no Newestlikes when author of like getting post", async () => {
    const expectedObj: ViewCommentModel = {
      ...firstPostOfFirstBlog,
      extendedLikesInfo: {
        dislikesCount: 1,
        likesCount: 0,
        myStatus: LikeStatus.Dislike,
        newestLikes: [],
      },
    };

    const result = await request(baseUrl)
      .get(`/posts/${firstPostOfFirstBlog.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body.extendedLikesInfo.newestLikes.length).toBe(0);
    expect(result.body).toEqual(expectedObj);
  });

  // Put "None" to post
  it("PUT: should put 'None' to post", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.None,
    };

    await request(baseUrl)
      .put(`/posts/${firstPostOfFirstBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  it("GET: post must have likes:0 and myStatus:'None' and no Newestlikes when author of like getting post", async () => {
    const expectedObj: ViewCommentModel = {
      ...firstPostOfFirstBlog,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };

    const result = await request(baseUrl)
      .get(`/posts/${firstPostOfFirstBlog.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body.extendedLikesInfo.newestLikes.length).toBe(0);
    expect(result.body).toEqual(expectedObj);
  });

  // Create second Blog
  it('POST: first user should create second blog', async () => {
    const data: CreateBlogModel = {
      name: 'New Blog 2',
      websiteUrl: 'https://www.youtube.com',
      description: 'some description',
    };

    const result = await request(baseUrl).post('/blogs').set('Authorization', basicAuthValue).send(data);

    secondBlog = result.body;

    expect(result.status).toBe(201);
    const expectedObj: ViewBlogModel = {
      id: expect.any(String),
      name: data.name,
      websiteUrl: data.websiteUrl,
      description: data.description,
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    };
    expect(result.body).toEqual(expectedObj);
  });

  // Create first Post
  it('POST: first user should create first post of second blog', async () => {
    const data: CreatePostModel = {
      title: 'First post of second blog',
      shortDescription: 'descr',
      content: 'content',
      blogId: secondBlog.id,
    };

    const result = await request(baseUrl).post('/posts').set('Authorization', basicAuthValue).send(data);

    firstPostOfSecondBlog = result.body;

    const expectedObj: ViewPostModel = {
      id: expect.any(String),
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      blogId: data.blogId,
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    };
    expect(result.status).toBe(201);
    expect(firstPostOfSecondBlog).toEqual(expectedObj);
    expect(firstPostOfSecondBlog.extendedLikesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    });
  });

  // Create second Post
  it('POST: first user should create second post of second blog', async () => {
    const data: CreatePostModel = {
      title: 'Second post of second blog',
      shortDescription: 'descr',
      content: 'content',
      blogId: secondBlog.id,
    };

    const result = await request(baseUrl).post('/posts').set('Authorization', basicAuthValue).send(data);

    secondPostOfSecondBlog = result.body;

    const expectedObj: ViewPostModel = {
      id: expect.any(String),
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      blogId: data.blogId,
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    };
    expect(result.status).toBe(201);
    expect(secondPostOfSecondBlog).toEqual(expectedObj);
    expect(secondPostOfSecondBlog.extendedLikesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    });
  });

  // Create third Post
  it('POST: first user should create third post of second blog', async () => {
    const data: CreatePostModel = {
      title: 'Third post of second blog',
      shortDescription: 'descr',
      content: 'content',
      blogId: secondBlog.id,
    };

    const result = await request(baseUrl).post('/posts').set('Authorization', basicAuthValue).send(data);

    thirdPostOfSecondBlog = result.body;

    const expectedObj: ViewPostModel = {
      id: expect.any(String),
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      blogId: data.blogId,
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: expect.any(Object),
    };
    expect(result.status).toBe(201);
    expect(thirdPostOfSecondBlog).toEqual(expectedObj);
    expect(thirdPostOfSecondBlog.extendedLikesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    });
  });

  // Put "Like" to first post by first User
  it("PUT: should put 'Like' to first post of second blog by first User", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/posts/${firstPostOfSecondBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  // Put "Dislike" to second post by first User
  it("PUT: should put 'Dislike' to second post of second blog by first User", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Dislike,
    };

    await request(baseUrl)
      .put(`/posts/${secondPostOfSecondBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  // Put "Like" to third post by first User
  it("PUT: should put 'Like' to third post of second blog by first User", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/posts/${thirdPostOfSecondBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  // ------------------------------------------
  // Login by second User
  it('POST: should login using second user', async () => {
    const data: LoginInputModel = {
      loginOrEmail: secondUser.login,
      password: usersPassword,
    };

    const result = await request(baseUrl)
      .post('/auth/login')
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(200);

    expect(result.body).toEqual({
      accessToken: expect.any(String),
    });

    jwtToken = result.body.accessToken;
  });

  // Put "Like" to first post by second User
  it("PUT: should put 'Like' to first post of second blog by second User", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/posts/${firstPostOfSecondBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  // Put "Like" to second post by second User
  it("PUT: should put 'Dislike' to second post of second blog by second User", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/posts/${secondPostOfSecondBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  // Put "Dislike" to third post by second User
  it("PUT: should put 'Dislike' to third post of second blog by second User", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Dislike,
    };

    await request(baseUrl)
      .put(`/posts/${thirdPostOfSecondBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  // Login by third User
  it('POST: should login using third user', async () => {
    const data: LoginInputModel = {
      loginOrEmail: thirdUser.login,
      password: usersPassword,
    };

    const result = await request(baseUrl)
      .post('/auth/login')
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(200);

    expect(result.body).toEqual({
      accessToken: expect.any(String),
    });

    jwtToken = result.body.accessToken;
  });

  // Put "Like" to first post by third User
  it("PUT: should put 'Like' to first post of second blog by third User", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/posts/${firstPostOfSecondBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  // Put "Like" to second post by third User
  it("PUT: should put 'Like' to second post of second blog by third User", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/posts/${secondPostOfSecondBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  // Put "None" to first post by third User
  it("PUT: should put 'None' to second post of second blog by third User", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.None,
    };

    await request(baseUrl)
      .put(`/posts/${secondPostOfSecondBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  // Put "Dislike" to third post by third User
  it("PUT: should put 'Dislike' to third post of second blog by third User", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Dislike,
    };

    await request(baseUrl)
      .put(`/posts/${thirdPostOfSecondBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);
  });

  //Check posts of blog
  it('GET: posts of second blog received by third User must be correct', async () => {
    const expectedFirstPost: ViewPostModel = {
      ...firstPostOfSecondBlog,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 3,
        myStatus: LikeStatus.Like,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: thirdUser.id,
            login: thirdUser.login,
          },
          {
            addedAt: expect.any(String),
            userId: secondUser.id,
            login: secondUser.login,
          },
          {
            addedAt: expect.any(String),
            userId: firstUser.id,
            login: firstUser.login,
          },
        ],
      },
    };

    const expectedSecondPost: ViewPostModel = {
      ...secondPostOfSecondBlog,
      extendedLikesInfo: {
        dislikesCount: 1,
        likesCount: 1,
        myStatus: LikeStatus.None,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: secondUser.id,
            login: secondUser.login,
          },
        ],
      },
    };

    const expectedThirdPost: ViewPostModel = {
      ...thirdPostOfSecondBlog,
      extendedLikesInfo: {
        dislikesCount: 2,
        likesCount: 1,
        myStatus: LikeStatus.Dislike,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: firstUser.id,
            login: firstUser.login,
          },
        ],
      },
    };

    const result = await request(baseUrl)
      .get(`/blogs/${secondBlog.id}/posts`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body.items.length).toBe(3);
    expect(result.body.items[0]).toEqual(expectedThirdPost);
    expect(result.body.items[1]).toEqual(expectedSecondPost);
    expect(result.body.items[2]).toEqual(expectedFirstPost);
  });

  //Check posts for the same information by second user
  // Login by second User
  it('POST: should login using second user to check posts', async () => {
    const data: LoginInputModel = {
      loginOrEmail: secondUser.login,
      password: usersPassword,
    };

    const result = await request(baseUrl)
      .post('/auth/login')
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(200);

    expect(result.body).toEqual({
      accessToken: expect.any(String),
    });

    jwtToken = result.body.accessToken;
  });

  it('GET: posts received by second User must be correct', async () => {
    const expectedFirstPost: ViewPostModel = {
      ...firstPostOfSecondBlog,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 3,
        myStatus: LikeStatus.Like,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: thirdUser.id,
            login: thirdUser.login,
          },
          {
            addedAt: expect.any(String),
            userId: secondUser.id,
            login: secondUser.login,
          },
          {
            addedAt: expect.any(String),
            userId: firstUser.id,
            login: firstUser.login,
          },
        ],
      },
    };

    const expectedSecondPost: ViewPostModel = {
      ...secondPostOfSecondBlog,
      extendedLikesInfo: {
        dislikesCount: 1,
        likesCount: 1,
        myStatus: LikeStatus.Like,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: secondUser.id,
            login: secondUser.login,
          },
        ],
      },
    };

    const expectedThirdPost: ViewPostModel = {
      ...thirdPostOfSecondBlog,
      extendedLikesInfo: {
        dislikesCount: 2,
        likesCount: 1,
        myStatus: LikeStatus.Dislike,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: firstUser.id,
            login: firstUser.login,
          },
        ],
      },
    };

    const result = await request(baseUrl).get(`/posts`).set('Authorization', `Bearer ${jwtToken}`).expect(200);

    expect(result.body.items.length).toBe(4);
    expect(result.body.items[0]).toEqual(expectedThirdPost);
    expect(result.body.items[1]).toEqual(expectedSecondPost);
    expect(result.body.items[2]).toEqual(expectedFirstPost);
  });

  // Delete post
  it('POST: should login using first user to delete post', async () => {
    const data: LoginInputModel = {
      loginOrEmail: firstUser.login,
      password: usersPassword,
    };

    const result = await request(baseUrl)
      .post('/auth/login')
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(200);

    expect(result.body).toEqual({
      accessToken: expect.any(String),
    });

    jwtToken = result.body.accessToken;
  });

  it('DELETE: should delete post', async () => {
    await request(baseUrl).delete(`/posts/${firstPostOfFirstBlog.id}`).set('Authorization', basicAuthValue).expect(204);
  });

  it("PUT: shouldn`t put 'Like' to deleted post", async () => {
    const data: UpdateLikeModel = {
      likeStatus: LikeStatus.Like,
    };

    await request(baseUrl)
      .put(`/posts/${firstPostOfFirstBlog.id}/like-status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(404);
  });
});
