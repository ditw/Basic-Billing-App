import { Module } from '@nestjs/common';
import { CurrenciesController } from '@app/currencies/controllers/currencies.controller';
import { CurrenciesService } from '@app/currencies/services/currencies.service';

@Module({
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}
