import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    example: 'account-001',
    description: 'Unique identifier for the account',
  })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    example: 'USD',
    description: 'Currency code assigned to the account',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    example: 20,
    description: 'Discount percentage applied to monthly fee (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate: number;

  @ApiProperty({
    example: 30,
    description: 'Number of discount days active',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  discountDays: number;

  @ApiProperty({
    example: 100,
    description: 'Minimum transaction volume threshold',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  transactionThreshold: number;
}
