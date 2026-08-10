export class Account {
  accountId: string;
  currency: string;
  transactionThreshold: number;
  discountDays: number;
  discountRate: number; // e.g., 20 = 20%
  createdAt: Date;
}
