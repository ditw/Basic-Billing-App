import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CalculateBillDto {
  @ApiProperty({
    example: '2026-08-01',
    description: 'Start date of the billing period in ISO date format (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  billingPeriodStart: string;

  @ApiProperty({
    example: '2026-08-31',
    description: 'End date of the billing period in ISO date format (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  billingPeriodEnd: string;

  @ApiProperty({
    example: 150,
    description: 'Total number of transactions processed during the billing period',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  transactionCount: number;
}
