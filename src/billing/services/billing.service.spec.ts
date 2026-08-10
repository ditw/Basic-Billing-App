import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BillingService } from '@app/billing/services/billing.service';
import { AccountsService } from '@app/accounts/services/accounts.service';
import { CurrenciesService } from '@app/currencies/services/currencies.service';

describe('BillingService', () => {
  let billingService: BillingService;
  let accountsService: AccountsService;
  let currenciesService: CurrenciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingService, AccountsService, CurrenciesService],
    }).compile();

    billingService = module.get<BillingService>(BillingService);
    accountsService = module.get<AccountsService>(AccountsService);
    currenciesService = module.get<CurrenciesService>(CurrenciesService);
  });

  it('should calculate correct bill with excess transactions and active promotional discount', () => {
    // 1. Setup Currency (£10.00 base fee)
    currenciesService.create({ currency: 'USD', monthlyFeeGbp: 10.0 });

    // 2. Setup Account (100 threshold, 30 discount days, 20% discount)
    accountsService.create({
      accountId: 'account-001',
      currency: 'USD',
      transactionThreshold: 100,
      discountDays: 30,
      discountRate: 20,
    });

    // 3. Calculate Bill (150 transactions = 50 excess = £5.00 excess fee)
    // Base (£10) + Excess (£5) = Subtotal £15.00
    // Active 20% discount on £15.00 = -£3.00 therefore Total = £12.00
    const bill = billingService.calculateBill('account-001', {
      billingPeriodStart: new Date().toISOString(),
      billingPeriodEnd: new Date(Date.now() + 86400000).toISOString(),
      transactionCount: 150,
    });

    expect(bill.breakdown.baseFeeGbp).toBe(10.0);
    expect(bill.breakdown.excessTransactions).toBe(50);
    expect(bill.breakdown.transactionFeeGbp).toBe(5.0);
    expect(bill.breakdown.subtotalGbp).toBe(15.0);
    expect(bill.breakdown.isDiscountActive).toBe(true);
    expect(bill.breakdown.discountAmountGbp).toBe(3.0);
    expect(bill.totalGbp).toBe(12.0);
  });

  it('should not apply promotional discount if the discount period has expired', () => {
    currenciesService.create({ currency: 'EUR', monthlyFeeGbp: 20.0 });

    const account = accountsService.create({
      accountId: 'account-002',
      currency: 'EUR',
      transactionThreshold: 50,
      discountDays: 10,
      discountRate: 50,
    });

    // Simulate account created 15 days ago
    account.createdAt = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

    const bill = billingService.calculateBill('account-002', {
      billingPeriodStart: new Date().toISOString(),
      billingPeriodEnd: new Date(Date.now() + 86400000).toISOString(),
      transactionCount: 50, // No excess transactions
    });

    expect(bill.breakdown.isDiscountActive).toBe(false);
    expect(bill.breakdown.discountAmountGbp).toBe(0);
    expect(bill.totalGbp).toBe(20.0);
  });

  it('should throw BadRequestException for invalid billing period date order', () => {
    currenciesService.create({ currency: 'GBP', monthlyFeeGbp: 5.0 });
    accountsService.create({
      accountId: 'account-003',
      currency: 'GBP',
      transactionThreshold: 10,
      discountDays: 0,
      discountRate: 0,
    });

    expect(() => {
      billingService.calculateBill('account-003', {
        billingPeriodStart: '2026-02-10T00:00:00.000Z',
        billingPeriodEnd: '2026-02-01T00:00:00.000Z',
        transactionCount: 5,
      });
    }).toThrow(BadRequestException);
  });

  it('should throw NotFoundException if account does not exist', () => {
    expect(() => {
      billingService.calculateBill('non_existent', {
        billingPeriodStart: '2026-01-01T00:00:00.000Z',
        billingPeriodEnd: '2026-01-31T00:00:00.000Z',
        transactionCount: 0,
      });
    }).toThrow(NotFoundException);
  });
});
