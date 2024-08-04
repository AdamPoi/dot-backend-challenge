import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { Post } from 'src/posts/entities/post.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const mockUser: CreateUserDto = {
    username: 'test',
    password: '12345',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(User).execute();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  it('/auth/register (POST)', async () => {
    await request(app.getHttpServer())
      .post(`/auth/register`)
      .send(mockUser)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('username');
        expect(res.body.user).not.toHaveProperty('password');
      });
  });

  it('/auth/login (POST)', async () => {
    await request(app.getHttpServer())
      .post(`/auth/login`)
      .send(mockUser)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('username');
        expect(res.body.user).not.toHaveProperty('password');
      });
  });

  it('fails if credentials incorrect', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...mockUser, password: 'wrong password' })
      .expect(401)
      .expect((res) => {
        expect(res.body).not.toHaveProperty('accessToken');
      });
  });
});
