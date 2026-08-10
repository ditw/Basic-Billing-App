import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '@app/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const globalPrefix = process.env.GLOBAL_PREFIX || 'v1';
    app.setGlobalPrefix(globalPrefix, {
      exclude: ['/', `/${globalPrefix}`],
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - should redirect to Swagger UI', () => {
    return request(app.getHttpServer() as Server)
      .get('/')
      .expect(302)
      .expect('Location', '/api');
  });

  it('/v1 (GET) - should return application metadata', () => {
    return request(app.getHttpServer() as Server)
      .get('/v1')
      .expect(200)
      .expect({
        service: 'basic-billing-app',
        status: 'online',
        version: '1.0.0',
        documentation: '/api',
        apiPrefix: 'v1',
      });
  });
});
