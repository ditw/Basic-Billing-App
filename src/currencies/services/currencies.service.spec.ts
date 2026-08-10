import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CurrenciesService } from '@app/currencies/services/currencies.service';

describe('CurrenciesService', () => {
  let service: CurrenciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrenciesService],
    }).compile();

    service = module.get<CurrenciesService>(CurrenciesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create and store a currency', () => {
      const result = service.create({
        currency: 'usd',
        monthlyFeeGbp: 15.0,
      });

      expect(result).toEqual({
        currency: 'USD',
        monthlyFeeGbp: 15.0,
      });
    });

    it('should throw ConflictException if currency already exists', () => {
      service.create({ currency: 'GBP', monthlyFeeGbp: 10.0 });

      expect(() => {
        service.create({ currency: 'gbp', monthlyFeeGbp: 12.0 });
      }).toThrow(ConflictException);
    });
  });

  describe('findByCode', () => {
    it('should find an existing currency by code (case-insensitive)', () => {
      service.create({ currency: 'EUR', monthlyFeeGbp: 20.0 });

      const found = service.findByCode('eur');

      expect(found).toEqual({
        currency: 'EUR',
        monthlyFeeGbp: 20.0,
      });
    });

    it('should throw NotFoundException if currency is not registered', () => {
      expect(() => {
        service.findByCode('JPY');
      }).toThrow(NotFoundException);
    });
  });
});
