import { Module } from '@nestjs/common';
import { BillingController } from '@app/billing/controllers/billing.controller';
import { BillingService } from '@app/billing/services/billing.service';
import { AccountsModule } from '@app/accounts/accounts.module';
import { CurrenciesModule } from '@app/currencies/currencies.module';

@Module({
  imports: [AccountsModule, CurrenciesModule],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
