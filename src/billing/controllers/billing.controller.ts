import { Controller, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BillingService } from '../services/billing.service';
import { CalculateBillDto } from '../dto/calculate-bill.dto';

@ApiTags('Billing')
@Controller('accounts')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post(':accountId/bill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate monthly billing for an account' })
  @ApiParam({
    name: 'accountId',
    example: 'account-001',
    description: 'Account ID to calculate billing for',
  })
  @ApiResponse({
    status: 200,
    description: 'Billing calculated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error in request body or parameter.',
  })
  @ApiResponse({
    status: 404,
    description: 'Account or associated currency not found.',
  })
  calculateBill(@Param('accountId') accountId: string, @Body() dto: CalculateBillDto) {
    return this.billingService.calculateBill(accountId, dto);
  }
}
