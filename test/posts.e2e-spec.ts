import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { CreatePostDto } from 'src/posts/dto/create-post.dto';
import { Post } from 'src/posts/entities/post.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let dataSource: DataSource;
  let currentUser: User;

  const mockUser: CreateUserDto = {
    username: 'testpost',
    password: '12345',
  };
  const mockPost: CreatePostDto = {
    title: 'post title',
    content: 'test content',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(User).execute();
    await dataSource.createQueryBuilder().delete().from(Post).execute();
    await request(app.getHttpServer())
      .post(`/auth/register`)
      .send(mockUser)
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .post(`/auth/login`)
      .send(mockUser)
      .expect(HttpStatus.OK)
      .expect((res) => {
        jwtToken = res.body.accessToken;
        currentUser = res.body.user;
      });
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  it('/posts (POST)', async () => {
    await request(app.getHttpServer())
      .post(`/posts`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(mockPost)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Object);
      });
  });

  it('/posts (GET)', async () => {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values([
        {
          title: 'test title 2',
          content: 'test content 2',
          user: currentUser,
        },
      ])
      .execute();
    return request(app.getHttpServer())
      .get(`/posts`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('title');
        expect(res.body[0]).toHaveProperty('content');
      });
  });

  it('/posts/:id (GET)', async () => {
    const postResponse = await request(app.getHttpServer())
      .post(`/posts`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(mockPost)
      .expect(HttpStatus.CREATED);

    return request(app.getHttpServer())
      .get(`/posts/${postResponse.body.id}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('title');
        expect(res.body).toHaveProperty('content');
      });
  });

  it('/posts/:id (PATCH)', async () => {
    const postResponse = await request(app.getHttpServer())
      .post(`/posts`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(mockPost)
      .expect(HttpStatus.CREATED);

    return request(app.getHttpServer())
      .patch(`/posts/${postResponse.body.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ title: 'new title' })
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('title', 'new title');
        expect(res.body).toHaveProperty('content');
      });
  });

  it('/posts/:id (DELETE)', async () => {
    const postResponse = await request(app.getHttpServer())
      .post(`/posts`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(mockPost)
      .expect(HttpStatus.CREATED);

    return request(app.getHttpServer())
      .delete(`/posts/${postResponse.body.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.NO_CONTENT);
  });
});
