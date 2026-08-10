import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { CurrenciesModule } from '@app/currencies/currencies.module';
import { AccountsModule } from '@app/accounts/accounts.module';
import { BillingModule } from '@app/billing/billing.module';
import { HealthModule } from '@app/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    CurrenciesModule,
    AccountsModule,
    BillingModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
