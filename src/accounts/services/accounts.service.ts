import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
  private readonly accounts = new Map<string, Account>();

  create(dto: CreateAccountDto): Account {
    this.logger.log(`Attempting to create account: ${dto.accountId}`);

    if (this.accounts.has(dto.accountId)) {
      this.logger.warn(`Account creation failed: ${dto.accountId} already exists`);
      throw new ConflictException(`Account with ID '${dto.accountId}' already exists.`);
    }

    const account: Account = {
      ...dto,
      currency: dto.currency.toUpperCase(),
      createdAt: new Date(),
    };

    this.accounts.set(dto.accountId, account);
    this.logger.log(`Account successfully created: ${account.accountId}`);

    return account;
  }

  findById(accountId: string): Account {
    const account = this.accounts.get(accountId);
    if (!account) {
      this.logger.warn(`Account lookup failed: ${accountId} not found`);
      throw new NotFoundException(`Account '${accountId}' not found.`);
    }
    return account;
  }
}
