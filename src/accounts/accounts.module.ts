import { Module } from '@nestjs/common';
import { AccountsController } from '@app/accounts/controllers/accounts.controller';
import { AccountsService } from '@app/accounts/services/accounts.service';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
