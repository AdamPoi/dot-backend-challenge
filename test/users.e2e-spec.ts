import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let dataSource: DataSource;
  let currentUser: User;

  const mockUser: CreateUserDto = {
    username: 'testuser',
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

  it('/users (GET)', async () => {
    const bcrypt = require('bcrypt');
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          username: 'testuser1',
          password: await bcrypt.hash('12345', 10),
        },
      ])
      .execute();
    return request(app.getHttpServer())
      .get(`/users`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('username');
      });
  });

  it('/users/:id (GET)', async () => {
    return request(app.getHttpServer())
      .get(`/users/${currentUser.id}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('username');
      });
  });

  // it('/users/:id (PATCH)', async () => {
  //   const loginResponse = await request(app.getHttpServer())
  //     .post(`/auth/login`)
  //     .send(mockUser)
  //     .expect(HttpStatus.OK);

  //   jwtToken = loginResponse.body.accessToken;

  //   const postResponse = await request(app.getHttpServer())
  //     .post(`/users`)
  //     .set('Authorization', `Bearer ${jwtToken}`)
  //     .send(mockUser)
  //     .expect(HttpStatus.CREATED);

  //   return request(app.getHttpServer())
  //     .patch(`/users/${postResponse.body.id}`)
  //     .set('Authorization', `Bearer ${jwtToken}`)
  //     .send({ title: 'new title' })
  //     .expect(HttpStatus.OK)
  //     .expect((res) => {
  //       expect(res.body).toHaveProperty('id');
  //       expect(res.body).toHaveProperty('title', 'new title');
  //       expect(res.body).toHaveProperty('content');
  //     });
  // });

  // it('/users/:id (DELETE)', async () => {
  //   const loginResponse = await request(app.getHttpServer())
  //     .post(`/auth/login`)
  //     .send(mockUser)
  //     .expect(HttpStatus.OK);

  //   jwtToken = loginResponse.body.accessToken;

  //   const postResponse = await request(app.getHttpServer())
  //     .post(`/users`)
  //     .set('Authorization', `Bearer ${jwtToken}`)
  //     .send(mockUser)
  //     .expect(HttpStatus.CREATED);

  //   return request(app.getHttpServer())
  //     .delete(`/users/${postResponse.body.id}`)
  //     .set('Authorization', `Bearer ${jwtToken}`)
  //     .expect(HttpStatus.NO_CONTENT);
  // });
});
