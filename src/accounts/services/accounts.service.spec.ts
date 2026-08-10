import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountsService } from '@app/accounts/services/accounts.service';

describe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsService],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an account with a timestamp', () => {
      const result = service.create({
        accountId: 'account-001',
        currency: 'usd',
        transactionThreshold: 50,
        discountDays: 14,
        discountRate: 10,
      });

      expect(result.accountId).toBe('account-001');
      expect(result.currency).toBe('USD'); // Normalized
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw ConflictException if accountId already exists', () => {
      service.create({
        accountId: 'account-duplicate',
        currency: 'GBP',
        transactionThreshold: 10,
        discountDays: 0,
        discountRate: 0,
      });

      expect(() => {
        service.create({
          accountId: 'account-duplicate',
          currency: 'EUR',
          transactionThreshold: 20,
          discountDays: 5,
          discountRate: 5,
        });
      }).toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return the account when found', () => {
      service.create({
        accountId: 'account-002',
        currency: 'GBP',
        transactionThreshold: 100,
        discountDays: 30,
        discountRate: 15,
      });

      const found = service.findById('account-002');

      expect(found.accountId).toBe('account-002');
      expect(found.discountRate).toBe(15);
    });

    it('should throw NotFoundException if account does not exist', () => {
      expect(() => {
        service.findById('non_existent_id');
      }).toThrow(NotFoundException);
    });
  });
});
