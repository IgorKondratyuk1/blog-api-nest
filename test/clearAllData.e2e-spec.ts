import request from 'supertest';
import { CreateBlogModel } from './models/blog/createBlogModel';
import { basicAuthValue } from './users.e2e-spec';
import { ViewBlogModel } from './models/blog/viewBlogModel';
import { ViewPostModel } from './models/post/viewPostModel';
import { CreatePostModel } from './models/post/createPostModel';

// Testing: Delete all data
describe('/testing/delete', () => {
  const baseUrl = 'http://localhost:3000/api';

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
    };
    expect(result.body).toEqual(expectedObj);
  });

  // Create Post
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

    const firstPost = result.body;

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

  //Check that arrays is not empty
  it('GET:blogs should return not empty arr', async () => {
    const result = await request(baseUrl).get('/blogs');

    expect(result.status).toBe(200);
    expect(result.body.items.length).toBeGreaterThan(0);
  });

  it('GET: should return empty array', async () => {
    const result = await request(baseUrl).get('/posts');

    expect(result.status).toBe(200);
    expect(result.body.items.length).toBeGreaterThan(0);
  });

  // DELETE
  it('DELETE: should delete data from all array', async () => {
    await request(baseUrl).delete('/testing/all-data').expect(204);
  });

  //Check that arrays is empty
  it('GET:blogs should return not empty arr', async () => {
    const result = await request(baseUrl).get('/blogs').expect(200, []);
  });

  it('GET: should return empty array', async () => {
    const result = await request(baseUrl).get('/posts').expect(200, []);
  });
});
