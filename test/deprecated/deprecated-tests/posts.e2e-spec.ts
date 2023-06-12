import request from 'supertest';
import { basicAuthValue } from './users.e2e-spec';
import { ViewBlogModel } from '../models/blog/viewBlogModel';
import { CreateBlogModel } from '../models/blog/createBlogModel';
import { BlogType } from '../types/blogTypes';
import { PostType } from '../types/postTypes';
import { ViewPostModel } from '../models/post/viewPostModel';
import { CreatePostOfBlogModel } from '../models/post/createPostOfBlog';
import { CreatePostModel } from '../models/post/createPostModel';
import { Paginator } from '../types/types';
import { UpdatePostModel } from '../models/post/updatePostModel';

// 1. Testing: Posts of blog Route
describe('/blogs/:blogId/posts', () => {
  const BLOGS_QUANTITY = 5,
    POSTS_QUANTITY = 10;
  const arrOfBlogs: BlogType[] = [],
    arrOfPosts: PostType[] = [];

  const baseUrl = 'http://localhost:3000/api';

  beforeAll(async () => {
    await request(baseUrl).delete('/testing/all-data').set('Authorization', basicAuthValue);
    console.log('Database is empty');
  });

  it('POST: should be created 3 blogs', async () => {
    for (let i = 0; i < BLOGS_QUANTITY; i++) {
      const data: CreateBlogModel = {
        name: `New Blog ${i}`,
        websiteUrl: `https://www.youtube.com/channel-${i}`,
        description: 'some description',
      };

      const result = await request(baseUrl).post('/blogs').set('Authorization', basicAuthValue).send(data);

      arrOfBlogs.push(result.body);

      const expectedObj: ViewBlogModel = {
        id: expect.any(String),
        name: arrOfBlogs[i].name,
        websiteUrl: arrOfBlogs[i].websiteUrl,
        description: data.description,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      };
      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedObj);
    }
  });

  it('POST: should be created 5 posts of blog', async () => {
    for (let i = 0; i < POSTS_QUANTITY; i++) {
      const data: CreatePostOfBlogModel = {
        title: `Correct title ${i}`,
        shortDescription: `descr of ${i}`,
        content: `content of ${i}`,
      };

      const result = await request(baseUrl)
        .post(`/blogs/${arrOfBlogs[0].id}/posts`)
        .set('Authorization', basicAuthValue)
        .send(data);

      arrOfPosts.push(result.body);

      const expectedObj: ViewPostModel = {
        id: expect.any(String),
        title: arrOfPosts[i].title,
        shortDescription: arrOfPosts[i].shortDescription,
        content: arrOfPosts[i].content,
        blogId: arrOfPosts[i].blogId,
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: expect.any(Object),
      };
      expect(result.status).toBe(201);
      expect(arrOfPosts[i]).toEqual(expectedObj);
    }
  });

  it('POST: shouldn`t be created post of not existing blog', async () => {
    const data: CreatePostOfBlogModel = {
      title: `Correct title`,
      shortDescription: `descr`,
      content: `content`,
    };

    await request(baseUrl).post('/blogs/100/posts').set('Authorization', basicAuthValue).send(data).expect(404);
  });

  it('POST: shouldn`t be created post without auth', async () => {
    const data: CreatePostModel = {
      title: `Correct title`,
      shortDescription: `descr`,
      content: `content`,
      blogId: '100',
    };

    await request(baseUrl).post('/posts').send(data).expect(401);
  });

  it('POST: shouldn`t be created post with wrong data (title.length > 30)', async () => {
    const data: CreatePostOfBlogModel = {
      title: 'ccccccccccccccccccccccccccccccc',
      shortDescription: `descr`,
      content: `content`,
    };

    await request(baseUrl)
      .post(`/blogs/${arrOfBlogs[0].id}/posts`)
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(400);
  });

  // GET Posts of Blog
  it('GET: should return created posts of blog with default pagination', async () => {
    const result = await request(baseUrl).get(`/blogs/${arrOfBlogs[0].id}/posts`).expect(200);

    const expectedObj: Paginator<ViewPostModel> = {
      page: 1,
      pageSize: 10,
      pagesCount: 1,
      totalCount: 10,
      items: expect.any(Array),
    };

    expect(result.body).toEqual(expectedObj);
    expect(result.body.items.length).toBe(10);
    expect(result.body.items[0]).toEqual(arrOfPosts[arrOfPosts.length - 1]);
    expect(result.body.items[1]).toEqual(arrOfPosts[arrOfPosts.length - 2]);
  });

  it('GET: should return correct posts of blog', async () => {
    const result = await request(baseUrl)
      .get(`/blogs/${arrOfBlogs[0].id}/posts?pageNumber=1&pageSize=3&sortBy=createdAt&sortDirection=desc`)
      .expect(200);

    const expectedObj: Paginator<ViewPostModel> = {
      page: 1,
      pageSize: 3,
      pagesCount: 4,
      totalCount: 10,
      items: expect.any(Array),
    };

    expect(result.body).toEqual(expectedObj);
    expect(result.body.items.length).toBe(3);
    expect(result.body.items[0]).toEqual(arrOfPosts[arrOfPosts.length - 1]);
    expect(result.body.items[1]).toEqual(arrOfPosts[arrOfPosts.length - 2]);
  });

  it('GET: should return created posts of blog', async () => {
    const result = await request(baseUrl)
      .get(`/blogs/${arrOfBlogs[0].id}/posts?pageNumber=4&pageSize=3&sortBy=createdAt&sortDirection=desc`)
      .expect(200);

    const expectedObj: Paginator<ViewPostModel> = {
      page: 4,
      pageSize: 3,
      pagesCount: 4,
      totalCount: 10,
      items: expect.any(Array),
    };

    expect(result.body).toEqual(expectedObj);
    expect(result.body.items.length).toBe(1);
    expect(result.body.items[0]).toEqual(arrOfPosts[0]);
  });

  // DELETE Created data
  it('DELETE: should delete data from all array', async () => {
    await request(baseUrl).delete('/testing/all-data').expect(204);
  });

  //Check that arrays is empty
  it('GET:blogs should return not empty arr', async () => {
    const result = await request(baseUrl).get('/blogs').expect(200);

    expect(result.body.items.length).toBe(0);
  });

  it('GET: should return empty array', async () => {
    const result = await request(baseUrl).get('/posts').expect(200);

    expect(result.body.items.length).toBe(0);
  });
});

// Testing: Posts Route
describe('/posts', () => {
  const baseUrl = 'http://localhost:3000/api';

  beforeAll(async () => {
    await request(baseUrl).delete('/testing/all-data').set('Authorization', basicAuthValue);
    console.log('Database is empty');
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

  // GET
  it('GET: should return empty array', async () => {
    const response = await request(baseUrl).get('/posts').expect(200);

    expect(response.body.items.length).toBe(0);
  });

  // POST
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

  it('POST: shouldn`t create post without Authorization header', async () => {
    const data = {
      title: 'Correct title',
      shortDescription: 'descr',
      content: 'content',
      blogId: firstBlog.id,
    };

    await request(baseUrl).post('/posts').send(data).expect(401);
  });

  it('POST: shouldn`t create post with incorrect data', async () => {
    const data = {
      shortDescription: 'descr',
      content: 'content',
      blogId: firstBlog.id,
    };

    const result = await request(baseUrl).post('/posts').set('Authorization', basicAuthValue).send(data).expect(400);
  });

  it('POST: shouldn`t create post with not existed blogId', async () => {
    const data = {
      title: 'Correct title',
      shortDescription: 'descr',
      content: 'content',
      blogId: '1000',
    };

    const result = await request(baseUrl).post('/posts').set('Authorization', basicAuthValue).send(data).expect(400);

    const expectedError = {
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'blogId',
        },
      ],
    };
  });

  // Checking that post is not created
  it('GET: should return 1 element. Checking that post is not created', async () => {
    const result = await request(baseUrl).get('/posts').expect(200);

    console.log(result.body.items);
    console.log(firstPost);

    expect(result.body.items.length).toBe(1);
    expect(result.body.items[0]).toEqual(firstPost);
  });

  // PUT
  it('PUT: should update post with correct data', async () => {
    const data: UpdatePostModel = {
      title: 'Changed title',
      shortDescription: 'new descr',
      content: 'content',
      blogId: firstBlog.id,
    };

    await request(baseUrl).put(`/posts/${firstPost.id}`).set('Authorization', basicAuthValue).send(data).expect(204);

    // GET:Checking updated post
    const updatedPost = await request(baseUrl).get(`/posts/${firstPost.id}`);

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
    expect(updatedPost.body).toEqual(expectedObj);
  });

  it('PUT: shouldn`t update post with incorrect data', async () => {
    const data: UpdatePostModel = {
      title: 'Changed title123456789012345678901234567890',
      shortDescription: 'new descr',
      content: 'content',
      blogId: firstBlog.id,
    };

    await request(baseUrl).put(`/posts/${firstPost.id}`).set('Authorization', basicAuthValue).send(data).expect(400);
  });

  it('PUT: shouldn`t update post with incorrect blogId', async () => {
    const data: UpdatePostModel = {
      title: 'Changed title',
      shortDescription: 'new descr',
      content: 'content',
      blogId: '111',
    };

    await request(baseUrl).put(`/posts/${firstPost.id}`).set('Authorization', basicAuthValue).send(data).expect(400);
  });

  it('PUT: shouldn`t update not existing post (id)', async () => {
    const data: UpdatePostModel = {
      title: 'Changed title',
      shortDescription: 'new descr',
      content: 'content',
      blogId: firstBlog.id,
    };

    await request(baseUrl)
      .put(`/posts/1111`) // Post not exists
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(404);
  });

  //DELETE;
  it('DELETE: shouldn`t delete post with wrong id', async () => {
    await request(baseUrl)
      .delete(`/posts/1111`) // Post not exists
      .set('Authorization', basicAuthValue)
      .expect(404);
  });

  it('DELETE: should return empty array', async () => {
    await request(baseUrl).delete(`/posts/${firstPost.id}`).set('Authorization', basicAuthValue).expect(204);
  });

  // Check that arr is empty
  it('GET: should return empty array', async () => {
    const result = await request(baseUrl).get('/posts');

    expect(result.status).toBe(200);
    expect(result.body.items).toEqual([]);
  });
});
