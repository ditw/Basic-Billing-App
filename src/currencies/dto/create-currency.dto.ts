import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({
    example: 'USD',
    description: 'ISO 4217 Currency Code',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    example: 15.0,
    description: 'Base monthly maintenance fee in GBP',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  monthlyFeeGbp: number;
}
