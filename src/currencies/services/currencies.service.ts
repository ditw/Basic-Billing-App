import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { Currency } from '../entities/currency.entity';
import { CreateCurrencyDto } from '../dto/create-currency.dto';

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name);
  private readonly currencies = new Map<string, Currency>();

  create(dto: CreateCurrencyDto): Currency {
    const key = dto.currency.toUpperCase();
    this.logger.log(`Attempting to create currency: ${dto.currency}`);

    if (this.currencies.has(key)) {
      this.logger.warn(`Currency creation failed: ${dto.currency} already exists`);
      throw new ConflictException(`Currency '${key}' already exists.`);
    }

    const currency: Currency = {
      currency: key,
      monthlyFeeGbp: dto.monthlyFeeGbp,
    };

    this.currencies.set(key, currency);
    this.logger.log(`Currency successfully created: ${currency.currency}`);
    return currency;
  }

  findByCode(code: string): Currency {
    const currency = this.currencies.get(code.toUpperCase());
    if (!currency) {
      this.logger.warn(`Currency lookup failed: ${code} not found`);
      throw new NotFoundException(`Currency '${code}' is not registered.`);
    }
    return currency;
  }
}
