export interface BillResponse {
  accountId: string;
  currency: string;
  billingPeriod: {
    start: string;
    end: string;
  };
  totalGbp: number;
  breakdown: {
    baseFeeGbp: number;
    transactionCount: number;
    threshold: number;
    excessTransactions: number;
    perTransactionFeeGbp: number;
    transactionFeeGbp: number;
    subtotalGbp: number;
    discountDays: number;
    discountRatePercentage: number;
    isDiscountActive: boolean;
    discountAmountGbp: number;
  };
}
