import request from 'supertest';
import { basicAuthValue, usersPassword } from './users.e2e-spec';
import { CreateUserModel } from './models/user/createUserModel';
import { ViewUserModel } from './models/user/viewUserModel';
import { LoginInputModel } from './models/auth/login/loginInputModel';
import { CreateBlogModel } from './models/blog/createBlogModel';
import { CreatePostModel } from './models/post/createPostModel';
import { ViewBlogModel } from './models/blog/viewBlogModel';
import { ViewPostModel } from './models/post/viewPostModel';
import { ViewCommentModel } from './models/comment/viewCommentModel';
import { CreateCommentModel } from './models/comment/createCommentModel';
import { LikeStatus } from '../src/modules/blogs-composition/modules/likes/types/like';
import { UpdateCommentModel } from './models/comment/updateCommentModel';
import { CommentType } from './types/commentTypes';

// Testing: Comments Route
describe('/comments', () => {
  const baseUrl = 'http://localhost:3000/api';
  let jwtToken = '';
  const bearerAuth = `Bearer ${jwtToken}`;

  beforeAll(async () => {
    await request(baseUrl).delete('/testing/all-data').set('Authorization', basicAuthValue);
    console.log('Database is empty');
  });

  // --------- Prepare Data ---------
  // Create first User
  let firstUser: any = null;
  let firstUserId: string;
  it('POST: should create first user', async () => {
    const data: CreateUserModel = {
      email: 'testUser1@gmail.com',
      login: 'test1',
      password: usersPassword,
    };

    const result = await request(baseUrl)
      .post('/users')
      .set('Authorization', basicAuthValue)
      .send(data);

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
  let secondUser: any = null;
  let secondUserId: string;
  it('POST: should create second user', async () => {
    const data: CreateUserModel = {
      email: 'testUser2@gmail.com',
      login: 'test2',
      password: usersPassword,
    };

    const result = await request(baseUrl)
      .post('/users')
      .set('Authorization', basicAuthValue)
      .send(data);

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

  it('Get: get current (firstUser) user data', async () => {
    const result = await request(baseUrl)
      .get('/auth/me')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual({
      email: firstUser.email,
      login: firstUser.login,
      userId: expect.any(String),
    });

    firstUserId = result.body.userId;
  });

  // Create Blog
  let firstBlog: any = null;
  it('POST: should create blog', async () => {
    const data: CreateBlogModel = {
      name: 'New Blog',
      websiteUrl: 'https://www.youtube.com',
      description: 'some description',
    };

    const result = await request(baseUrl)
      .post('/blogs')
      .set('Authorization', basicAuthValue)
      .send(data);

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

    const result = await request(baseUrl)
      .post('/posts')
      .set('Authorization', basicAuthValue)
      .send(data);

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

  // --------- POST & Get: Create & Read operations ---------
  // Create first comment
  let firstComment: any = null;
  it('POST: should create comment with correct data', async () => {
    const data: CreateCommentModel = {
      content: 'firs comment data stringstringstringst 123',
    };

    const result = await request(baseUrl)
      .post(`/posts/${firstPost.id}/comments`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(201);

    firstComment = result.body;

    const expectedObj: ViewCommentModel = {
      id: expect.any(String),
      content: data.content,
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
      commentatorInfo: {
        userId: firstUserId,
        userLogin: firstUser.login,
      },
    };
    expect(firstComment).toEqual(expectedObj);
  });

  it('POST: shouldn`t create comment with incorrect data', async () => {
    const data: CreateCommentModel = {
      content: '1',
    };

    const result = await request(baseUrl)
      .post(`/posts/${firstPost.id}/comments`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
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
    const data: CreateCommentModel = {
      content: 'firs comment data stringstringstringst',
    };

    await request(baseUrl)
      .post(`/posts/123/comments`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(404);
  });

  // Checking that new post have one comment
  it('GET: should return 1 element. Checking that wrong comments is not created', async () => {
    const result = await request(baseUrl).get(`/posts/${firstPost.id}/comments`).expect(200);

    expect(result.body.items.length).toBe(1);
    expect(result.body.items[0]).toEqual(firstComment);
  });

  it('POST: shouldn`t create post without Authorization header JWT', async () => {
    const data: CreateCommentModel = {
      content: 'firs comment data stringstringstringst',
    };

    await request(baseUrl).post(`/posts/${firstPost.id}/comments`).send(data).expect(401);
  });

  // --------- PUT: Update operations ---------
  it('PUT: should update comment with correct data', async () => {
    const data: UpdateCommentModel = {
      content: 'New content correct data str str str str',
    };

    await request(baseUrl)
      .put(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(204);

    // GET:Checking updated post
    const updatedComment = await request(baseUrl).get(`/comments/${firstComment.id}`);

    const expectedObj: ViewCommentModel = {
      id: expect.any(String),
      content: data.content,
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
      commentatorInfo: {
        userId: firstUserId,
        userLogin: firstUser.login,
      },
    };
    expect(updatedComment.body).toEqual(expectedObj);
  });

  it('PUT: shouldn`t update comment with incorrect data', async () => {
    const data: UpdateCommentModel = {
      content: '1',
    };

    const response = await request(baseUrl)
      .put(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'content',
        },
      ],
    });
  });

  it('PUT: shouldn`t update comment without jwt token', async () => {
    const data: UpdateCommentModel = {
      content: 'New content correct data str str str str',
    };

    await request(baseUrl).put(`/comments/${firstComment.id}`).send(data).expect(401);
  });

  it('PUT: shouldn`t update not existing comment (id)', async () => {
    const data: UpdateCommentModel = {
      content: 'New content correct data str str str str',
    };

    await request(baseUrl)
      .put(`/comments/111`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(404);
  });

  // --------- Testing Forbidden operations (403) ---------
  // --------- Prepare data ---------
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

  it('Get: get current (secondUser) user data', async () => {
    const result = await request(baseUrl)
      .get('/auth/me')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual({
      email: secondUser.email,
      login: secondUser.login,
      userId: expect.any(String),
    });

    secondUserId = result.body.userId;
  });

  // --------- PUT: Testing forbidden update ---------
  const updatingText = 'Content updated by 2-nd user str str str str';
  it('PUT: shouldn`t update comment of other user', async () => {
    const data: UpdateCommentModel = {
      content: updatingText,
    };

    await request(baseUrl)
      .put(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(data)
      .expect(403);
  });

  // Checking
  it('GET: should return same first comment #1', async () => {
    const result = await request(baseUrl).get(`/comments/${firstComment.id}`).expect(200);
    const expData: CommentType = firstComment;
    expData.content = 'New content correct data str str str str';

    console.log('exp');
    console.log(expData);
    console.log(result.body);
    expect(result.body).toEqual(expData);
  });

  // --------- PUT: Testing forbidden delete ---------
  it('DELETE: should delete comment', async () => {
    await request(baseUrl)
      .delete(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(403);
  });

  // Checking
  it('GET: should return same first comment #2', async () => {
    const result = await request(baseUrl).get(`/comments/${firstComment.id}`).expect(200);

    expect(result.body).toEqual(firstComment);
  });

  // --------- DELETE: Testing deleting of comments ---------
  // --------- Prepare data: User relogin ---------

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

  it('Get: get current (firstUser) user data', async () => {
    const result = await request(baseUrl)
      .get('/auth/me')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(result.body).toEqual({
      email: firstUser.email,
      login: firstUser.login,
      userId: expect.any(String),
    });

    firstUserId = result.body.userId;
  });

  // --------- ---------

  it('DELETE: shouldn`t delete comment with wrong id', async () => {
    await request(baseUrl)
      .delete(`/comments/111`) // Post not exists
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(404);
  });

  it('DELETE: shouldn`t delete comment without jwt token', async () => {
    await request(baseUrl).delete(`/comments/${firstComment.id}`).expect(401);
  });

  it('DELETE: should delete comment', async () => {
    await request(baseUrl)
      .delete(`/comments/${firstComment.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(204);
  });

  // Check that arr is empty
  it('GET: should return empty array of comments', async () => {
    const result = await request(baseUrl).get(`/posts/${firstPost.id}/comments`).expect(200);

    expect(result.body.items).toEqual([]);
  });
});
