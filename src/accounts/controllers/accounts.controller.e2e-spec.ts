import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AccountsModule } from '@app/accounts/accounts.module';
import { ConfigService } from '@nestjs/config';
import { Server } from 'net';
import { AppModule } from '@app/app.module';

describe('AccountsController (HTTP Integration)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let api: (path: string) => string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AccountsModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const configService = app.get(ConfigService);
    const prefix = configService.get<string>('GLOBAL_PREFIX', '');
    if (prefix) app.setGlobalPrefix(prefix);

    api = (path: string) => (prefix ? `/${prefix}${path}` : path);

    await app.init();

    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /accounts - should create a new account (201 Created)', async () => {
    const response = await request(httpServer)
      .post(api('/accounts'))
      .send({
        accountId: 'account-test-001',
        currency: 'GBP',
        transactionThreshold: 100,
        discountDays: 14,
        discountRate: 15,
      })
      .expect(201);

    const body = response.body as Record<string, unknown>;

    expect(body).toMatchObject({
      accountId: 'account-test-001',
      currency: 'GBP',
      transactionThreshold: 100,
      discountDays: 14,
      discountRate: 15,
    });
    expect(body.createdAt).toBeDefined();
  });

  it('POST /accounts - should return 400 Bad Request on invalid payload (discountRate > 100)', async () => {
    await request(httpServer)
      .post(api('/accounts'))
      .send({
        accountId: 'account-invalid',
        currency: 'GBP',
        transactionThreshold: 10,
        discountDays: 5,
        discountRate: 150, // Invalid: exceeds @Max(100)
      })
      .expect(400);
  });

  it('POST /accounts - should return 409 Conflict if accountId already exists', async () => {
    const payload = {
      accountId: 'account-duplicate',
      currency: 'USD',
      transactionThreshold: 50,
      discountDays: 0,
      discountRate: 0,
    };

    // First request succeeds
    await request(httpServer).post(api('/accounts')).send(payload).expect(201);

    // Duplicate request fails
    await request(httpServer).post(api('/accounts')).send(payload).expect(409);
  });
});
