import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@app/app.module';
import { ConfigService } from '@nestjs/config';
import { Server } from 'net';

interface BillingBillResponse {
  accountId: string;
  totalGbp: number;
  breakdown: Record<string, unknown>;
}

describe('BillingController (HTTP Integration)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let api: (path: string) => string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

  it('POST /accounts/:accountId/bill - should calculate bill for an existing account (200 OK)', async () => {
    // 1. Setup Currency
    await request(httpServer)
      .post(api('/currencies'))
      .send({ currency: 'USD', monthlyFeeGbp: 10.0 })
      .expect(201);

    // 2. Setup Account (100 threshold, 30 discount days, 20% rate)
    await request(httpServer)
      .post(api('/accounts'))
      .send({
        accountId: 'account-bill-001',
        currency: 'USD',
        transactionThreshold: 100,
        discountDays: 30,
        discountRate: 20,
      })
      .expect(201);

    // 3. Calculate Bill (150 txs = 50 excess * £0.10 = £5.00 tx fee. Subtotal £15 - 20% discount = £12.00)
    const response = await request(httpServer)
      .post(api('/accounts/account-bill-001/bill'))
      .send({
        billingPeriodStart: '2026-08-01T00:00:00.000Z',
        billingPeriodEnd: '2026-08-31T23:59:59.000Z',
        transactionCount: 150,
      })
      .expect(200);

    const body = response.body as BillingBillResponse;

    expect(body.accountId).toBe('account-bill-001');
    expect(body.totalGbp).toBe(12.0);
    expect(body.breakdown).toEqual({
      baseFeeGbp: 10.0,
      transactionCount: 150,
      threshold: 100,
      excessTransactions: 50,
      perTransactionFeeGbp: 0.1,
      transactionFeeGbp: 5.0,
      subtotalGbp: 15.0,
      discountDays: 30,
      discountRatePercentage: 20,
      isDiscountActive: true,
      discountAmountGbp: 3.0,
    });
  });

  it('POST /accounts/:accountId/bill - should return 404 NotFound if account does not exist', async () => {
    await request(httpServer)
      .post(api('/accounts/non-existent-account/bill'))
      .send({
        billingPeriodStart: '2026-08-01T00:00:00.000Z',
        billingPeriodEnd: '2026-08-31T23:59:59.000Z',
        transactionCount: 10,
      })
      .expect(404);
  });

  it('POST /accounts/:accountId/bill - should return 400 Bad Request on unknown properties', async () => {
    await request(httpServer)
      .post(api('/accounts/account-bill-001/bill'))
      .send({
        billingPeriodStart: '2026-08-01T00:00:00.000Z',
        billingPeriodEnd: '2026-08-31T23:59:59.000Z',
        transactionCount: 50,
        extraProperty: 'forbidden', // Triggers forbidNonWhitelisted
      })
      .expect(400);
  });
});
