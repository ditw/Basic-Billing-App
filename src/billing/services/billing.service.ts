import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AccountsService } from '@app/accounts';
import { CurrenciesService } from '@app/currencies';
import { CalculateBillDto } from '../dto/calculate-bill.dto';
import { BillResponse } from '../interfaces/bill-response.interface';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  // Standard fixed fee charged per excess transaction in GBP (£0.10)
  private readonly EXCESS_TRANSACTION_FEE_GBP = 0.1;

  constructor(
    private readonly accountsService: AccountsService,
    private readonly currenciesService: CurrenciesService,
  ) {}

  calculateBill(accountId: string, dto: CalculateBillDto): BillResponse {
    this.logger.log(`Calculating bill for account: ${accountId}`);

    const startDate = new Date(dto.billingPeriodStart);
    const endDate = new Date(dto.billingPeriodEnd);

    if (startDate >= endDate) {
      throw new BadRequestException('billingPeriodStart must be earlier than billingPeriodEnd.');
    }

    const account = this.accountsService.findById(accountId);
    const currency = this.currenciesService.findByCode(account.currency);

    // 1. Base Fee
    const baseFeeGbp = currency.monthlyFeeGbp;

    // 2. Transaction Fee Calculation
    const excessCount = Math.max(0, dto.transactionCount - account.transactionThreshold);
    const transactionFeeGbp = this.roundToTwoDecimals(
      excessCount * this.EXCESS_TRANSACTION_FEE_GBP,
    );

    const subtotalGbp = this.roundToTwoDecimals(baseFeeGbp + transactionFeeGbp);

    // 3. Discount Eligibility
    const discountExpiryDate = new Date(
      account.createdAt.getTime() + account.discountDays * 24 * 60 * 60 * 1000,
    );

    // Discount applies if the billing period starts within the account's promotional window
    const isDiscountActive = account.discountRate > 0 && startDate < discountExpiryDate;

    let discountAmountGbp = 0;
    if (isDiscountActive) {
      discountAmountGbp = this.roundToTwoDecimals(subtotalGbp * (account.discountRate / 100));
    }

    const totalGbp = this.roundToTwoDecimals(Math.max(0, subtotalGbp - discountAmountGbp));

    this.logger.log(
      `Bill calculated for ${accountId}: total = £${totalGbp} (Base: £${baseFeeGbp}, Discount: £${discountAmountGbp})`,
    );

    return {
      accountId: account.accountId,
      currency: account.currency,
      billingPeriod: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      totalGbp,
      breakdown: {
        baseFeeGbp,
        transactionCount: dto.transactionCount,
        threshold: account.transactionThreshold,
        excessTransactions: excessCount,
        perTransactionFeeGbp: this.EXCESS_TRANSACTION_FEE_GBP,
        transactionFeeGbp,
        subtotalGbp,
        discountDays: account.discountDays,
        discountRatePercentage: account.discountRate,
        isDiscountActive,
        discountAmountGbp,
      },
    };
  }

  private roundToTwoDecimals(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }
}
