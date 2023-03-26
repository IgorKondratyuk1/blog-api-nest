import request from 'supertest';
import { basicAuthValue } from './users.e2e-spec';
import { CreateBlogModel } from './models/blog/createBlogModel';
import { ViewBlogModel } from './models/blog/viewBlogModel';
import { UpdateBlogModel } from './models/blog/updateBlogModel';
import { APIErrorResult, Paginator } from './types/types';

// Testing: Blogs Route
describe('/blogs', () => {
  const baseUrl = 'http://localhost:3000/api';

  beforeAll(async () => {
    await request(baseUrl).delete('/testing/all-data').set('Authorization', basicAuthValue);
    console.log('Database is empty');
  });

  // POST
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

  it('GET: should return created blog', async () => {
    const result = await request(baseUrl).get(`/blogs/${firstBlog.id}`);

    expect(result.status).toBe(200);
    expect(result.body).toEqual(firstBlog);
  });

  let secondBlog: any = null;
  it('POST: should create blog with spaces', async () => {
    const data: CreateBlogModel = {
      name: '   Spaces       ',
      websiteUrl: 'https://www.youtube.com',
      description: 'some description',
    };
    const result = await request(baseUrl)
      .post('/blogs')
      .set('Authorization', basicAuthValue)
      .send(data);

    secondBlog = result.body;

    expect(result.status).toBe(201);
    const expecedObj: ViewBlogModel = {
      id: expect.any(String),
      name: data.name.trim(),
      websiteUrl: data.websiteUrl,
      description: data.description,
      createdAt: expect.any(String),
      isMembership: expect.any(Boolean),
    };
    expect(result.body).toEqual(expecedObj);
  });

  it('GET: should return created blogs', async () => {
    const result = await request(baseUrl).get('/blogs').expect(200);

    const expectedObj: Paginator<ViewBlogModel> = {
      page: 1,
      pageSize: 10,
      pagesCount: 1,
      totalCount: 2,
      items: expect.any(Array),
    };

    console.log(firstBlog);
    console.log(result.body.items[1]);

    expect(result.body).toEqual(expectedObj);
    expect(result.body.items.length).toBe(2);
    expect(result.body.items[1]).toEqual(firstBlog);
    expect(result.body.items[0]).toEqual(secondBlog);
  });

  it('POST: shouldn`t create blog with lenth > 15', async () => {
    const data: CreateBlogModel = {
      name: '1234567890123456',
      websiteUrl: 'https://www.youtube.com',
      description: 'some description',
    };

    const result = await request(baseUrl)
      .post('/blogs')
      .set('Authorization', basicAuthValue)
      .send(data);

    expect(result.status).toBe(400);
    const expectedError: APIErrorResult = {
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'name',
        },
      ],
    };
    expect(result.body).toEqual(expectedError);
  });

  it('POST: shouldn`t create blog without websiteUrl', async () => {
    const result = await request(baseUrl).post('/blogs').set('Authorization', basicAuthValue).send({
      name: 'New blog',
    });

    expect(result.status).toBe(400);
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
    expect(result.body).toEqual(expectedError);
  });

  it('POST: shouldn`t create blog with lentgth > 100', async () => {
    const data: CreateBlogModel = {
      name: 'New post',
      websiteUrl:
        'https://www.youtube.comLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean m1',
      description: 'some description',
    };
    const result = await request(baseUrl)
      .post('/blogs')
      .set('Authorization', basicAuthValue)
      .send(data);

    expect(result.status).toBe(400);
    const expectedError: APIErrorResult = {
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'websiteUrl',
        },
      ],
    };
    expect(result.body).toEqual(expectedError);
  });

  it('POST: shouldn`t create blog with wrong url', async () => {
    const data: CreateBlogModel = {
      name: 'New blog',
      websiteUrl: 'https:\\/www.youtube.com',
      description: 'some description',
    };
    const result = await request(baseUrl)
      .post('/blogs')
      .set('Authorization', basicAuthValue)
      .send(data);

    expect(result.status).toBe(400);
    const expectedError = {
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'websiteUrl',
        },
      ],
    };
    expect(result.body).toEqual(expectedError);
  });

  // PUT
  it('PUT: blog should be updated by correct data', async () => {
    const data: UpdateBlogModel = {
      name: 'Changed title',
      websiteUrl: 'https://www.google.com',
      description: 'some description',
    };

    await request(baseUrl)
      .put(`/blogs/${firstBlog.id}`)
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(204);

    const result = await request(baseUrl).get(`/blogs/${firstBlog?.id}`);

    expect(result.status).toBe(200);
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

  it("PUT: blog shouldn`t be updated by wrong data (without field 'name')", async () => {
    await request(baseUrl)
      .put(`/blogs/${secondBlog.id}`)
      .set('Authorization', basicAuthValue)
      .send({
        websiteUrl: 'https://www.google.com',
      })
      .expect(400);

    const result = await request(baseUrl).get(`/blogs/${secondBlog?.id}`);

    expect(result.status).toBe(200);
    expect(result.body).toEqual(secondBlog);
  });

  it("PUT: blog shouldn`t be updated by wrong data (without field 'websiteUrl')", async () => {
    await request(baseUrl)
      .put(`/blogs/${secondBlog.id}`)
      .set('Authorization', basicAuthValue)
      .send({
        name: 'Changed Title',
      })
      .expect(400);

    const result = await request(baseUrl).get(`/blogs/${secondBlog?.id}`);

    expect(result.status).toBe(200);
    expect(result.body).toEqual(secondBlog);
  });

  it('PUT: blog shouldn`t be updated by wrong data (without wrong id)', async () => {
    const data: UpdateBlogModel = {
      name: 'Changed Title',
      websiteUrl: 'https://www.google.com',
      description: 'some description',
    };

    await request(baseUrl)
      .put(`/blogs/1234556789`)
      .set('Authorization', basicAuthValue)
      .send(data)
      .expect(404);
  });

  // DELETE
  it('DELETE: blog shouldn`t be deleted (without wrong id)', async () => {
    await request(baseUrl)
      .delete(`/blogs/1234556789`)
      .set('Authorization', basicAuthValue)
      .expect(404);
  });

  it('DELETE: blog should be deleted', async () => {
    await request(baseUrl)
      .delete(`/blogs/${firstBlog.id}`)
      .set('Authorization', basicAuthValue)
      .expect(204);

    await request(baseUrl)
      .delete(`/blogs/${secondBlog.id}`)
      .set('Authorization', basicAuthValue)
      .expect(204);
  });

  it('GET: should be 0 blogs', async () => {
    const result = await request(baseUrl).get('/blogs');

    expect(result.status).toBe(200);
    expect(result.body.items.length).toBe(0);
  });
});
